import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { HttpRequestMethods } from '..'
import { FeesDetails } from 'src/lib/types'
import { CacheTag } from './cacheTag'

interface ProgramFeesRequest {
  program_id: string
  segment_id?: string
}

interface UpdateProgramFeesRequest {
  fees?: number
  program_fees_id: string
}

export interface CreateProgramFeesRequest {
  program_id: string
  fees_type: string
  fees: number
  segment_id: string
}

const feeServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getProgramFeesDetails: build.query<FeesDetails, ProgramFeesRequest>({
      providesTags: [CacheTag.ProgramFees],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.getprogramFees,
          params
        }
      }
    }),
    updateProgramFees: build.mutation<string, UpdateProgramFeesRequest>({
      invalidatesTags: [CacheTag.ProgramFees],
      query: params => {
        return {
          method: HttpRequestMethods.PATCH,
          url: urlConstants.fees.updateprogramFees,
          params
        }
      }
    }),
    createProgramFees: build.mutation<string, CreateProgramFeesRequest>({
      invalidatesTags: [CacheTag.ProgramFees],
      query: details => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.fees.createProgramFees,
          body: details
        }
      }
    })
  })
})

export const { useLazyGetProgramFeesDetailsQuery, useUpdateProgramFeesMutation, useCreateProgramFeesMutation } =
  feeServiceApi
