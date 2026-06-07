import { urlConstants } from 'src/constants/urlConstants'
import { Section, UserPermissionRequest } from 'src/lib/interfaces'
import { BulkProcessResponse } from 'src/views/common/BulkProcessStatusModal'

import { HttpRequestMethods } from '..'

import { Address } from './admisissionsService'
import api from './api'
import { CacheTag } from './cacheTag'
import { UserProfile } from './viewServices'

export type CreateBookRequest = {
  book_id?: string
  book_name: string
  price: number
  available_quantity: number
  program_id?: string
  segment_id?: string
  medium_id?: string
  status?: number
  isCommon?: number
}

export type CreateProgramAddonRequest = {
  id?: string
  program_id: string
  addon_course_id: string
  fees: number
}

type updateAddonCourse = {
  id: string
  addon_course_name: string
}

type CreateCollegeProfileRequest = {
  college_name?: string
  campus_name?: string
  contact_numbers?: string
}

type UpdateProgramRequest = {
  id?: string
  program_name: string
  segment_ids?: string[]
}

export type UpdateLanguageRequest = {
  id?: string
  language_name?: string
}
type ProgramSegmentRequest = {
  id?: string
  program_id: string
  segment_id: string
}

interface CreateAddressRequest {
  address: Address
  user_id?: string
  user_type: string
}

interface CreateUserRequest {
  user_id?: string
  user: UserProfile
}

interface CreateRoleRequest {
  role_id?: string
  role_name: string
  permissions: Array<string>
}

export interface VehicleVendorRequest {
  id?: string
  name: string
  contact_number: string
  email: string
  address?: Address
}

export type CreateUpdateFeesType = {
  fees_type_id?: string
  fees_type: string
  status?: number
}

export type AddonCourseDetails = {
  program_addon_course_id?: string
  addon_course_id?: string
  program_id: string
  segment_id: string
  medium_id: string
  seating_capacity: number
  addon_course_fees: number
}
export type ProgramAddonCourseRequest = {
  addon_course_id?: string
  addon_course_name: string
  status?: number
  program_addon_courses?: AddonCourseDetails[]
}

type ProgramSegmentStatusUpdateRequest = {
  program_segment_id: string
  status: number
}

const adminServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createAddonCourse: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListAddonCourse],
      query: addon_course_name => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.addonCourse,
          params: { addon_course_name }
        }
      }
    }),

    createUpdateBook: build.mutation<BulkProcessResponse, CreateBookRequest[]>({
      invalidatesTags: [CacheTag.ListBooks],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateBook,
          body: params
        }
      }
    }),

    createLanguage: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListLanguages],
      query: language_name => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.language,
          params: { language_name }
        }
      }
    }),
    createProgram: build.mutation<string, UpdateProgramRequest>({
      invalidatesTags: [CacheTag.ListPrograms],
      query: ({ program_name, segment_ids }) => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.program,
          params: { program_name },
          body: segment_ids
        }
      }
    }),
    createProgramAddon: build.mutation<string, CreateProgramAddonRequest>({
      invalidatesTags: [CacheTag.ListProgramAddon],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.programAddon,
          body
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
    getUserPermissions: build.query<string[], string>({
      providesTags: [CacheTag.UserPermissions],
      query: user_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.admin.get.userPermissions,
          params: { user_id }
        }
      }
    }),

    updateAddonCourse: build.mutation<string, updateAddonCourse>({
      invalidatesTags: [CacheTag.ListAddonCourse],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.addonCourse,
          params
        }
      }
    }),
    updateAddonCourseStatus: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListAddonCourse],
      query: id => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.addonCourseStatus,
          params: { id }
        }
      }
    }),
    updateLangugage: build.mutation<string, UpdateLanguageRequest>({
      invalidatesTags: [CacheTag.ListLanguages],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.language,
          params
        }
      }
    }),
    updateCollegeProfile: build.mutation<string, CreateCollegeProfileRequest>({
      invalidatesTags: [CacheTag.CollegeProfile],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.collegeProfile,
          body
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
    updateProgramAddon: build.mutation<string, CreateProgramAddonRequest>({
      invalidatesTags: [CacheTag.ListProgramAddon],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.programAddon,
          body
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
    }),
    uploadCollegeLogo: build.mutation<string, File>({
      query: college_logo => {
        const formData = new FormData()
        formData.append('college_logo', college_logo)

        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.collgeLogo,
          body: formData
        }
      }
    }),
    updateUserStatus: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListUsers],
      query: id => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.userStatus,
          params: { id }
        }
      }
    }),
    deleteProgramBook: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListProgramBooks],
      query: id => {
        return {
          method: HttpRequestMethods.DELETE,
          url: urlConstants.admin.delete.programBook,
          params: { id }
        }
      }
    }),
    createUpdateAddress: build.mutation<string, CreateAddressRequest>({
      invalidatesTags: [CacheTag.Address],
      query: ({ user_id, user_type, address }) => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.createUpdateAddress,
          params: { user_id, user_type },
          body: address
        }
      }
    }),
    createUpdateUser: build.mutation<string, CreateUserRequest>({
      invalidatesTags: [CacheTag.User],
      query: ({ user_id, user }) => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateUser,
          params: { user_id },
          body: user
        }
      }
    }),
    createUpdateSection: build.mutation<string, Section>({
      invalidatesTags: [CacheTag.Section],
      query: section => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateSection,
          body: section
        }
      }
    }),
    updateUserPermissions: build.mutation<string, UserPermissionRequest>({
      invalidatesTags: [CacheTag.UserPermissions],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.updateUserPermissions,
          body
        }
      }
    }),
    createUpdateRole: build.mutation<string, CreateRoleRequest>({
      invalidatesTags: [CacheTag.RolesList],
      query: data => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateRole,
          body: data
        }
      }
    }),
    createUpdateSegment: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListSegments],
      query: segment_name => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateSegment,
          body: { segment_name }
        }
      }
    }),
    createUpdateFeesType: build.mutation<BulkProcessResponse, CreateUpdateFeesType[]>({
      invalidatesTags: [CacheTag.ListFeesTypes],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateFeesType,
          body
        }
      }
    }),
    createUpdateProgramAddonCourse: build.mutation<string, ProgramAddonCourseRequest>({
      invalidatesTags: [CacheTag.ListAddonCourse],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.createUpdateProgramAddonCourse,
          body
        }
      }
    }),
    updateProgramSegmentStatus: build.mutation<string, ProgramSegmentStatusUpdateRequest[]>({
      invalidatesTags: [CacheTag.ListProgramSegments],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.programSegmentStatus,
          body
        }
      }
    })
  })
})

export const {
  useCreateAddonCourseMutation,
  useCreateLanguageMutation,
  useCreateProgramMutation,
  useCreateProgramAddonMutation,
  useUpdateAddonCourseMutation,
  useUpdateAddonCourseStatusMutation,
  useUpdateCollegeProfileMutation,
  useUpdateLangugageMutation,
  useUpdateProgramMutation,
  useUpdateProgramAddonMutation,
  useCreateProgramSegmentMutation,
  useUpdateProgramStatusMutation,
  useUploadCollegeLogoMutation,
  useUpdateUserStatusMutation,
  useDeleteProgramBookMutation,
  useCreateUpdateAddressMutation,
  useCreateUpdateUserMutation,
  useCreateUpdateSectionMutation,
  useUpdateUserPermissionsMutation,
  useGetUserPermissionsQuery,
  useCreateUpdateRoleMutation,
  useCreateUpdateSegmentMutation,
  useCreateUpdateBookMutation,
  useCreateUpdateFeesTypeMutation,
  useCreateUpdateProgramAddonCourseMutation,
  useUpdateProgramSegmentStatusMutation
} = adminServiceApi
