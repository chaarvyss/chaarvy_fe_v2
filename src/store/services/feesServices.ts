import { urlConstants } from 'src/constants/urlConstants'
import { ProgramFeesDetailsResponse } from 'src/lib/types'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

interface ProgramFeesRequest {
  program_id: string
  segment_id?: string
  medium: string
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
  medium: string
}

export interface CreateProgramAddonCourseRequest {
  program_id: string
  addon_course_id: string
  fees: number
}

export interface GetProgramFeesRequest {
  program_id: string
  medium: string
}

interface ProgramFeesDetail {
  program_fees_id: string
  fees: number
  fees_type: string
  fees_type_id: string
  segment_id: string
  segment_name: string
  discount: number
}

interface AddonCourseFeesDetail {
  student_addon_program_id: string
  program_addon_course_id: string
  addon_coures_fees: number
  addon_course_name: string
  discount: number
}

interface BookFeesDetail {
  program_book_id: string
  book_name: string
  isChecked: boolean
  price: number
  quantity: number
  Total: number
}

export interface StudentProgramFeesDetailsResponse {
  prg_fees: ProgramFeesDetail[]
  addonCourse: AddonCourseFeesDetail[]
  books: BookFeesDetail[]
}

const feeServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getProgramFeesDetails: build.query<ProgramFeesDetailsResponse, ProgramFeesRequest>({
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
    }),
    getStudentAdmissionFeesDetails: build.query<StudentProgramFeesDetailsResponse, string>({
      query: application_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.getStudentAdmissionFees,
          params: { application_id }
        }
      }
    })
  })
})

export const {
  useLazyGetProgramFeesDetailsQuery,
  useUpdateProgramFeesMutation,
  useCreateProgramFeesMutation,
  useLazyGetStudentAdmissionFeesDetailsQuery
} = feeServiceApi
