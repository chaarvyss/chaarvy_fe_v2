import { urlConstants } from 'src/constants/urlConstants'
import { FilterProps } from 'src/lib/interfaces'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export type Address = {
  student_id?: string
  address_id?: string
  door_no?: string
  house_apartment_name?: string // new
  street?: string
  landmark?: string
  village_city?: string
  district?: string
  state?: string
  pincode?: string
}

export type Admissions = {
  application_id: string
  admission_number: string
  father_name: string
  dob: string
  city: string
  student_name: string
  contact_no_1: string
  program_name: string
  photo_url: string
}

export type AdmissionCounts = {
  total: number
  filtered: number
}

export type AdmissionsListResponse = {
  admissions: Admissions[]
  counts: AdmissionCounts
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
  section?: string
  second_language?: string
  segment?: string
  student_email?: string
  qualified_exam?: string
  qualified_exam_hallticket_no?: string
  qualified_exam_year_of_pass?: string
  subcaste?: string
  student_aadhar?: string
  student_name?: string
  application_fees_status?: string
}

export type StudentPhotoRequest = {
  student_id: string
  photo: File
}

interface CreateApplicationResponse {
  application_id?: string
  message?: string
}

interface Segment {
  segment_id: string
  segment_name: string
}

interface ActiveProgramMediumRequest {
  program_id: string
  segment_id: string
}

interface ActiveProgramSegmentSectionRequest extends ActiveProgramMediumRequest {
  medium_id: string
}

interface Medium {
  medium_id: string
  medium_name: string
}

interface Section {
  section_id: string
  section_name: string
  seating_capacity: number
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
      invalidatesTags: [CacheTag.ListStudentAddonPrograms],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.enrollAddonCourseUrl,
          body
        }
      }
    }),
    getAdmissionsList: build.query<AdmissionsListResponse, FilterProps | undefined>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.admissionsList,
          params
        }
      }
    }),

    getProcessingFees: build.query<number, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getProcessingFees
        }
      }
    }),

    getStudentAddress: build.query<Address, string>({
      providesTags: [CacheTag.StudentAddress],
      query: student_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.studentAddress,
          params: { student_id }
        }
      }
    }),

    getStudentEnrolledAddonCourses: build.query<StudentAddonCourseResponse[], string>({
      providesTags: [CacheTag.ListStudentAddonPrograms],
      query: student_course_enrollment_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.studentEnrolledAddonCourseUrl,
          params: { student_course_enrollment_id }
        }
      }
    }),
    uploadStudentPhoto: build.mutation<void, StudentPhotoRequest>({
      query: ({ student_id, photo }) => {
        const formData = new FormData()
        formData.append('file', photo)

        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.uploadStudentPhoto,
          body: formData,
          params: { student_id }
        }
      }
    }),
    getActiveProgramSegments: build.query<Segment[], string>({
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getActiveProgramSegmentsUrl,
          params: { program_id }
        }
      }
    }),
    getActiveSegmentMediums: build.query<Medium[], ActiveProgramMediumRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getActiveSegmentMediumsUrl,
          params
        }
      }
    }),

    getActiveMediumSections: build.query<Section[], ActiveProgramSegmentSectionRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getActiveMediumSectionsUrl,
          params
        }
      }
    }),

    // new apis for new students enrollment

    createUpdateAdmissionFormOne: build.mutation<
      { student_id: string; message: string; student_course_enrollment_id: string; application_fees_status: number },
      CreateUpdateAdmissionFormOneRequest
    >({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.createUpdateAdmissionFormOneUrl,
          body: body
        }
      }
    }),

    updateStudentDetailsF2: build.mutation<string, StudentDetailsRequest>({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.updateStudentDetailsF2Url,
          body: body
        }
      }
    }),

    getAdmissionFormOneDetail: build.query<AdmissionFormOneDetailsResponse, string>({
      query: student_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.admissionFormOneDetail,
          params: { student_id }
        }
      }
    }),

    getStudentDetailsFormTwo: build.query<StudentDetails, string>({
      query: student_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getStudentDetailsF2Url,
          params: { student_id }
        }
      }
    }),

    getAddonCoursesAvailableForStudent: build.query<AvailableAddonCourseForStudentResponse[], string>({
      providesTags: [CacheTag.ListStudentAddonPrograms],
      query: student_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getAddonCoursesAvailableForStudentUrl,
          params: { student_id }
        }
      }
    }),

    getStudentActiveCourseEnrollmentId: build.query<string, string>({
      query: student_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getStudentActiveCourseEnrollmentIdUrl,
          params: { student_id }
        }
      }
    }),

    getRawFeesDetails: build.query<RawFeesDetailsResponse, string>({
      query: student_course_enrollment_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getRawFeesDetailsUrl,
          params: { student_course_enrollment_id }
        }
      }
    }),

    setStudentPayableFees: build.mutation<string, SetFeesDetailsRequest>({
      invalidatesTags: [CacheTag.StudentPayableFees],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admissions.setStudentPayableFeesUrl,
          body
        }
      }
    }),

    getStudentPayableFeesDetails: build.query<SavedFeesJson, string>({
      providesTags: [CacheTag.StudentPayableFees],
      query: student_course_enrollment_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admissions.getStudentPayableFeesDetailsUrl,
          params: { student_course_enrollment_id }
        }
      }
    })
  })
})

export const {
  useCreateUpdateAdmissionMutation,
  useUploadStudentPhotoMutation,
  useLazyGetAdmissionsListQuery,
  useEnrollAddonCourseMutation,
  useGetStudentAddressQuery,
  useGetProcessingFeesQuery,
  useGetActiveProgramSegmentsQuery,
  useGetActiveSegmentMediumsQuery,
  useGetActiveMediumSectionsQuery,
  useCreateUpdateAdmissionFormOneMutation,
  useGetAdmissionFormOneDetailQuery,
  useUpdateStudentDetailsF2Mutation,
  useGetStudentDetailsFormTwoQuery,
  useGetAddonCoursesAvailableForStudentQuery,
  useGetStudentActiveCourseEnrollmentIdQuery,
  useGetStudentEnrolledAddonCoursesQuery,
  useGetRawFeesDetailsQuery,
  useSetStudentPayableFeesMutation,
  useGetStudentPayableFeesDetailsQuery
} = admissionServiceApi
