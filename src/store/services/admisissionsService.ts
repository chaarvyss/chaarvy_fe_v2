import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export type Address = {
  door_no?: string
  house_apartment_name?: string // new
  street?: string
  landmark?: string
  village_city?: string
  district?: string
  state?: string
  pincode?: string
}

export type CreateStudentAdmissionRequest = {
  application_id?: string
  address?: Address
  community?: string
  contact_no_1?: string
  contact_no_2?: string
  dob?: string
  father_aadhar?: string
  father_name?: string
  father_occupation?: string
  gender?: string
  medium?: string
  mother_aadhar?: string
  mother_name?: string
  mother_occupation?: string
  nationality?: string
  previous_school_or_college_name?: string
  previous_marks?: string
  program_id?: string
  religion?: string
  second_language?: string
  student_email?: string
  qualified_exam?: string
  qualified_exam_hallticket_no?: string
  qualified_exam_year_of_pass?: string
  subcaste?: string
  student_aadhar?: string
  student_name?: string
}

interface CreateApplicationResponse {
  application_id?: string
  message?: string
}
const admissionServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createUpdateAdmission: build.mutation<CreateApplicationResponse, CreateStudentAdmissionRequest>({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.createAdmission,
          body
        }
      }
    })
  })
})

export const { useCreateUpdateAdmissionMutation } = admissionServiceApi
