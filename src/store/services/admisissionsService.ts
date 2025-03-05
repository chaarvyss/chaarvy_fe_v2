import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

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

export type AdmissionsListResponse = {
  application_id: string
  student_name: string
  contact_no_1: string
  program_name: string
  photo_url: string
}

export type CreateStudentAdmissionRequest = {
  admission_number?: string
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
  photo_url?: string
  religion?: string
  second_language?: string
  segment?: string
  student_email?: string
  qualified_exam?: string
  qualified_exam_hallticket_no?: string
  qualified_exam_year_of_pass?: string
  subcaste?: string
  student_aadhar?: string
  student_name?: string
}

export type StudentAddonCourseResponse = {
  student_addon_program_id: string
  program_addon_course_id: string
}

export type StudentPhotoRequest = {
  application_id: string
  photo: File
}

interface CreateApplicationResponse {
  application_id?: string
  message?: string
}

interface EnrollAddonCourseRequest {
  application_id: string
  addon_courses: string[]
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
    }),
    enrollAddonCourse: build.mutation<string, EnrollAddonCourseRequest>({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.enrollAddonCourse,
          body
        }
      }
    }),
    getAdmissionsList: build.query<AdmissionsListResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.admissionsList
        }
      }
    }),
    getAdmissionDetail: build.query<CreateStudentAdmissionRequest, string>({
      query: application_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.admissionDetail,
          params: { application_id }
        }
      }
    }),
    getStudentEnrollendAddonCourses: build.query<StudentAddonCourseResponse[], string>({
      query: application_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.studentEnrolledAddonCourse,
          params: { application_id }
        }
      }
    }),
    uploadStudentPhoto: build.mutation<void, StudentPhotoRequest>({
      query: body => {
        const formData = new FormData()
        formData.append('file', body.photo)
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.uploadStudentPhoto,
          body: formData,
          params: { application_id: body.application_id }
        }
      }
    })
  })
})

export const {
  useCreateUpdateAdmissionMutation,
  useUploadStudentPhotoMutation,
  useGetAdmissionsListQuery,
  useLazyGetAdmissionDetailQuery,
  useLazyGetStudentEnrollendAddonCoursesQuery,
  useEnrollAddonCourseMutation
} = admissionServiceApi
