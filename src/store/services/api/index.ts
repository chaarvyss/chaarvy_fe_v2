import { createApi } from '@reduxjs/toolkit/query/react'

import { CacheTag } from '../cacheTag'

import baseQueryWithOptions, { serializeQueryArgsGlobal } from './baseQueryWithOptions'

export const baseCacheTimeInSeconds = 0

const api = createApi({
  baseQuery: baseQueryWithOptions,
  serializeQueryArgs: serializeQueryArgsGlobal,
  endpoints: () => ({}),
  keepUnusedDataFor: baseCacheTimeInSeconds,
  tagTypes: Object.keys(CacheTag)
})

export default api
