import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query'
import { sessionStorageKeys } from 'src/lib/enums'
import { ContentTypes, httpHeaders } from 'src/store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: headers => {
    const accessToken = sessionStorage.getItem(sessionStorageKeys.accessToken)
    const clcode = sessionStorage.getItem(sessionStorageKeys.clientCode)
    headers.set(httpHeaders.CONTENT_TYPE, ContentTypes.JSON)
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    if (clcode) {
      headers.set('clcode', clcode)
    }
    return headers
  },
  timeout: 5000
})

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    let { url, params = {}, ...rest } = args
    console.log(params, 'params')
    let filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value) // Serialize objects
        ])
    )

    let extUrl = Object.keys(filteredParams).length > 0 ? `?${new URLSearchParams(filteredParams).toString()}` : ''

    url = `${url}${extUrl}`

    return baseQuery({ url, ...rest }, api, extraOptions)
  },
  { maxRetries: 0 }
)

const baseQueryWithErrorHandling: typeof baseQueryWithRetry = async (args, api, extraOptions) => {
  const result = await baseQueryWithRetry(args, api, extraOptions)
  if (result.error) {
    const status = result.error?.status
    console.error('API Error:', status, result.error.data)
  }
  return result
}

export default baseQueryWithErrorHandling
