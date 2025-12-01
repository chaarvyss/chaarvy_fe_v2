import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import { Address } from './admisissionsService'
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
  address_id?: string
  jananabhumi_number?: string
  UDISE_number?: string
}

export interface UserProfile {
  user_id?: string
  address_id?: string
  status?: number
  name?: string
  username?: string
  mobile?: string
  email?: string
  Role?: string
  role_name?: string
  created_on?: string
  profile_pic?: string
  calender_id?: string
}

export interface UserCalenderResponse {
  calender_id?: string
}
export interface PaymentDetailResponse {
  admission_number: string
  amount: string
  college_name: string
  payment_mode: string
  receipt_number: string
  payment_datetime: string
  student_name: string
  father_name: string
  campus_name: string
  group: string
  medium: string
  gender: string
  transaction_id: string
  section: string
  student_type: string
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
      providesTags: [CacheTag.CollegeProfile, CacheTag.Address],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.myDetails
        }
      }
    }),
    getPaymentDetail: build.query<PaymentDetailResponse, string>({
      query: payment_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.paymentDetail,
          params: { payment_id }
        }
      }
    }),
    getAddress: build.query<Address, string>({
      providesTags: [CacheTag.Address],
      query: address_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.address,
          params: { address_id }
        }
      }
    }),
    getUserProfile: build.query<UserProfile, string>({
      providesTags: [CacheTag.User, CacheTag.Address],
      query: user_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.userProfile,
          params: { user_id }
        }
      }
    }),
    getUserCalender: build.query<UserCalenderResponse, void>({
      providesTags: [CacheTag.User, CacheTag.Address],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.userCalender
        }
      }
    })
  }),

  overrideExisting: true
})

export const {
  useLazyGetProgramSegmentDetailsQuery,
  useGetCollegeDetailsQuery,
  useLazyGetCollegeDetailsQuery,
  useLazyGetPaymentDetailQuery,
  useGetAddressQuery,
  useGetUserProfileQuery,
  useLazyGetUserCalenderQuery
} = viewServiceApi
