import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

interface ProgramSegment {
  segment_name: string
  program_segment_id: string
}

export interface CollegeDetailResponse {
  id?: string
  college_name?: string
  college_code?: string
  campus_name?: string
  college_logo?: string
  college_header?: string
  college_watermark?: string
  contact_numbers?: string
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
    }),
    getCollegeDetails: build.query<CollegeDetailResponse, void>({
      providesTags: [CacheTag.CollegeProfile],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.myDetails
        }
      }
    })
  }),
  overrideExisting: true
})

export const { useLazyGetProgramSegmentDetailsQuery, useGetCollegeDetailsQuery, useLazyGetCollegeDetailsQuery } =
  viewServiceApi
