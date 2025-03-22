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

export interface StudentPayableFeesRequest {
  application_id?: string
  fees_details?: string
  segment_id?: string
  payable_fees?: number
  paymentAggrement?: string
  no_of_terms?: number
  term_details?: string
}

export interface PaymentDetailRequest {
  payment_id?: string
  segment_id?: string
  application_id?: string
  amount?: number
  payment_mode?: string
  transaction_number?: string
}

export interface StudentPayableFeesResponse {
  student_payable_id: string
  application_id: string
  fees_details: StudentProgramFeesDetailsResponse
  segment_id: string
  payable_fees: number
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
  application_id: string
  segment_id: string
  email: string
}

export interface UpdateApplicationPaymentRequest {
  application_id: string
  segment_id: string
  transaction_id: string
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
    }),
    createStudentPayableFees: build.mutation<string, StudentPayableFeesRequest>({
      query: details => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.fees.createStudentPayableFees,
          body: details
        }
      }
    }),
    getStudentPayableFeesDetails: build.query<StudentPayableFeesResponse, StudentPayableFeesRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.fees.getStudentPayableFees,
          params
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
    getApplicationFeesPayment: build.query<any, ApplicationPaymentRequest>({
      query: params => ({
        url: urlConstants.fees.getApplicationFeesPaymentLink,
        params
      })
    }),

    updateApplicationPayment: build.query<any, UpdateApplicationPaymentRequest>({
      query: params => ({ url: urlConstants.fees.updateApplicationFeesPayment, params })
    })
  })
})

export const {
  useLazyGetProgramFeesDetailsQuery,
  useUpdateProgramFeesMutation,
  useCreateProgramFeesMutation,
  useLazyGetStudentAdmissionFeesDetailsQuery,
  useCreateStudentPayableFeesMutation,
  useLazyGetStudentPayableFeesDetailsQuery,
  useLazyGetStudentPendingFeesDetailsQuery,
  useRecordPaymentTransactionMutation,
  useLazyGetPaymentRecieptByPaymentIdQuery,
  useLazyUpdateApplicationPaymentQuery,
  useLazyGetApplicationFeesPaymentQuery
} = feeServiceApi
