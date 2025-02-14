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
  timeout: 5000
})

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    let { url, params = {}, ...rest } = args

    // Remove undefined, null, and empty string values, and serialize values correctly
    let filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value) // Serialize objects
        ])
    )

    // Generate query string correctly
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
