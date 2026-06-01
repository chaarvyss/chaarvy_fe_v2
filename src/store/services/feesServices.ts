import { urlConstants } from 'src/constants/urlConstants'
import { ProgramFeesDataResponse } from 'src/lib/types'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export interface CreateProgramFeesPayload {
  program_fees_id?: string
  segment_id: string
  medium_id: string
  section_id: string
  fees_type: string
  fees: number
}

export interface CreateProgramFeesRequest {
  body: CreateProgramFeesPayload[]
  program_id: string
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

export interface PaymentDetailRequest {
  payment_id?: string
  segment_id?: string
  application_id?: string
  amount?: number
  payment_mode?: string
  transaction_number?: string
  payment_date?: Date
}

export interface StudentPendingFeesDetails {
  segment_id: string
  segment_name: string
  payable: number
  paid: number
  payment_id: string
  status: number
  due_date: string
  payment_aggrement: number
}

export interface StudentPendingFeesDetailsResponse {
  admission_id: string
  application_id: string
  student_name: string
  program: string
  fees_details: StudentPendingFeesDetails[]
}

export interface RecordPaymentResponse {
  Message: string
  payment_id: string
}

export interface ApplicationPaymentRequest {
  student_course_enrollment_id: string[]
  source: 'web' | 'app'
  email: string
}

export interface UpdateProcessingFeesStatusRequest {
  payment_id: string
  transaction_number: string
  transaction_status: number
}

const feeServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getProgramFeesDetails: build.query<ProgramFeesDataResponse[], string>({
      providesTags: [CacheTag.ProgramFees],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.getprogramFees,
          params: { program_id }
        }
      }
    }),
    createUpdateProgramFees: build.mutation<string, CreateProgramFeesRequest>({
      invalidatesTags: [CacheTag.ProgramFees],
      query: ({ body, program_id }) => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.fees.createUpdateProgramFees,
          body,
          params: { program_id }
        }
      }
    }),
    getStudentPendingFeesDetails: build.query<StudentPendingFeesDetailsResponse, string>({
      providesTags: [CacheTag.StudentPayment],
      query: admission_number => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.getStudentPendingFees,
          params: { admission_number }
        }
      }
    }),
    recordPaymentTransaction: build.mutation<RecordPaymentResponse, PaymentDetailRequest>({
      invalidatesTags: [CacheTag.StudentPayment],
      query: details => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.fees.recordPaymentTransaction,
          body: details
        }
      }
    }),
    getPaymentRecieptByPaymentId: build.query<Blob, string>({
      query: payment_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.paymentRecieptByPaymentId,
          responseHandler: response => response.blob(),
          params: { payment_id }
        }
      }
    }),
    getApplicationFeesPayment: build.mutation<any, ApplicationPaymentRequest>({
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.fees.getApplicationFeesPaymentLink,
        body
      })
    }),

    updateProcessingFeesStatus: build.mutation<
      { is_bulk: boolean; student_id: string; message: string },
      UpdateProcessingFeesStatusRequest
    >({
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.fees.updateProcessingFeesStatusUrl,
        body
      })
    })
  })
})

export const {
  useGetProgramFeesDetailsQuery,
  useCreateUpdateProgramFeesMutation,
  useLazyGetStudentPendingFeesDetailsQuery,
  useRecordPaymentTransactionMutation,
  useLazyGetPaymentRecieptByPaymentIdQuery,
  useGetApplicationFeesPaymentMutation,
  useUpdateProcessingFeesStatusMutation
} = feeServiceApi
