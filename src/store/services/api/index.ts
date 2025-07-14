import { createApi } from '@reduxjs/toolkit/query/react'

import { CacheTag, MasterCacheTag } from '../cacheTag'

import baseQueryWithOptions, { serializeQueryArgsGlobal } from './baseQueryWithOptions'

export const baseCacheTimeInSeconds = 0

const api = createApi({
  baseQuery: baseQueryWithOptions,
  refetchOnMountOrArgChange: 30,
  serializeQueryArgs: serializeQueryArgsGlobal,
  endpoints: () => ({}),
  keepUnusedDataFor: baseCacheTimeInSeconds,
  tagTypes: [...Object.keys(CacheTag), ...Object.keys(MasterCacheTag)]
})

export default api
