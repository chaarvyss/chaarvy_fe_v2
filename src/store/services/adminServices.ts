import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { HttpRequestMethods } from '..'
import { CacheTag } from './cacheTag'

interface UpdateProgramRequest {
  id?: string
  program_name: string
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

export const { useCreateProgramMutation, useUpdateProgramMutation, useUpdateProgramStatusMutation } = adminServiceApi
