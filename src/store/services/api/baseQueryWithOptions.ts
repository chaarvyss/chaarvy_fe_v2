import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query'

import { sessionStorageKeys } from 'src/lib/enums'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: headers => {
    const accessToken = sessionStorage.getItem(sessionStorageKeys.accessToken)
    const clcode = sessionStorage.getItem(sessionStorageKeys.clientCode)
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    if (clcode) {
      headers.set('clcode', clcode)
    }

    return headers
  },
  timeout: 30000
})

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    let { url, params = {}, ...rest } = args
    const filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)])
    )

    const extUrl = Object.keys(filteredParams).length > 0 ? `?${new URLSearchParams(filteredParams).toString()}` : ''

    url = `${url}${extUrl}`

    return baseQuery({ url, ...rest }, api, extraOptions)
  },
  { maxRetries: 0 }
)

const baseQueryWithErrorHandling: typeof baseQueryWithRetry = async (args, api, extraOptions) => {
  const result = await baseQueryWithRetry(args, api, extraOptions)
  if (result.error) {
    const status = result.error?.status
    if (status == 401) {
      sessionStorage.clear()
      window.location.replace('/login')
    } else {
      console.error('API Error:', status, result.error.data)
    }
  }

  return result
}

export const serializeQueryArgsGlobal = ({ endpointName, queryArgs }) => {
  return `${endpointName}_${JSON.stringify(queryArgs ?? {})}`
}

export default baseQueryWithErrorHandling
