import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

interface ProgramSegment {
  segment_name: string
  program_segment_id: string
}

const viewServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getProgramSegmentDetails: build.query<ProgramSegment[], string>({
      providesTags: [CacheTag.ListProgramSegments],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.programSegments,
          params: { program_id }
        }
      }
    })
  }),
  overrideExisting: true
})

export const { useLazyGetProgramSegmentDetailsQuery } = viewServiceApi
