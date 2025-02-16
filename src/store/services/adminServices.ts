import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { HttpRequestMethods } from '..'
import { CacheTag } from './cacheTag'

interface UpdateProgramRequest {
  id?: string
  program_name: string
}

interface UpdateFeesTypeRequest {
  id?: string
  fees_type: string
}

interface ProgramSegmentRequest {
  id?: string
  program_id: string
  segment_id: string
}

const adminServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createProgram: build.mutation<string, UpdateProgramRequest>({
      invalidatesTags: [CacheTag.ListPrograms],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.program,
          params
        }
      }
    }),
    createProgramSegment: build.mutation<string, ProgramSegmentRequest>({
      invalidatesTags: [CacheTag.ListProgramSegments],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.programSegment,
          body
        }
      }
    }),
    createFeesType: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListFeesTypes],
      query: fees_type => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.feesType,
          params: { fees_type }
        }
      }
    }),
    updateFeesType: build.mutation<string, UpdateFeesTypeRequest>({
      invalidatesTags: [CacheTag.ListFeesTypes],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.feesType,
          params
        }
      }
    }),
    updateProgram: build.mutation<string, UpdateProgramRequest>({
      invalidatesTags: [CacheTag.ListPrograms],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.program,
          params
        }
      }
    }),
    updateProgramStatus: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListPrograms],
      query: id => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.programStatus,
          params: { id }
        }
      }
    })
  })
})

export const {
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useUpdateProgramStatusMutation,
  useCreateFeesTypeMutation,
  useUpdateFeesTypeMutation,
  useCreateProgramSegmentMutation
} = adminServiceApi
