import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query'

import { sessionStorageKeys } from 'src/lib/enums'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: headers => {
    if (window !== undefined) {
      const accessToken = sessionStorage.getItem(sessionStorageKeys.accessToken)

      const clcode = sessionStorage.getItem(sessionStorageKeys.clientCode)

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
      }

      if (clcode) {
        headers.set('clcode', clcode)
      }

      return headers
    }
  },
  timeout: 30000
})

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const request = typeof args === 'string' ? { url: args } : args

    const { url, params, ...rest } = request

    const filteredParams = Object.fromEntries(
      Object.entries(params ?? {})
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)])
    )

    const queryString = Object.keys(filteredParams).length > 0 ? `?${new URLSearchParams(filteredParams)}` : ''

    return baseQuery(
      {
        url: `${url}${queryString}`,
        ...rest
      },
      api,
      extraOptions
    )
  },
  { maxRetries: 0 }
)

const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithRetry(args, api, extraOptions)

  if (result.error) {
    const error = result.error

    const isAborted = error.status === 'FETCH_ERROR' && error.error?.includes('AbortError')

    if (isAborted) {
      return result
    }

    if (error.status === 401) {
      sessionStorage.removeItem(sessionStorageKeys.accessToken)
      window.location.replace('/login')

      return result
    }

    console.group('API Error')
    console.log('Request:', args)
    console.log('Error:', error)
    console.groupEnd()
  }

  return result
}

export const serializeQueryArgsGlobal = ({ endpointName, queryArgs }) => {
  return `${endpointName}_${JSON.stringify(queryArgs, Object.keys(queryArgs || {}).sort())}`
}

export default baseQueryWithErrorHandling
