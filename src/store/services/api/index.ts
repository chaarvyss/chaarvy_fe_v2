import { createApi } from '@reduxjs/toolkit/query/react'

import { CacheTag } from '../cacheTag'

import baseQueryWithOptions from './baseQueryWithOptions'

export const baseCacheTimeInSeconds = 30

const api = createApi({
  baseQuery: baseQueryWithOptions,
  endpoints: () => ({}),
  keepUnusedDataFor: baseCacheTimeInSeconds,
  tagTypes: Object.keys(CacheTag)
})

export default api
