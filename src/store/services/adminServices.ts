import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'
import { Address } from './admisissionsService'
import { UserProfile } from './viewServices'
import { Section, UserPermissionRequest } from 'src/lib/interfaces'

type CreateBook = {
  book_name: string
  price: number
}

export type CreateProgramAddonRequest = {
  id?: string
  program_id: string
  addon_course_id: string
  fees: number
}

type CreateProgramBookRequest = {
  program_book_id?: string
  program_id: string
  segment_id: string
  book_id: string
  second_language: string
  medium: string
}

type updateAddonCourse = {
  id: string
  addon_course_name: string
}

type UpdateBook = CreateBook & {
  book_id: string
}

type CreateCollegeProfileRequest = {
  college_name?: string
  campus_name?: string
  contact_numbers?: string
}

type UpdateProgramRequest = {
  id?: string
  program_name: string
}

type UpdateFeesTypeRequest = {
  id?: string
  fees_type: string
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
    createBook: build.mutation<string, CreateBook>({
      invalidatesTags: [CacheTag.ListBooks],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.book,
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
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.program,
          params
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
    createProgramBook: build.mutation<string, CreateProgramBookRequest>({
      invalidatesTags: [CacheTag.ListProgramBooks],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.programBook,
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
    createFeesType: build.mutation<string, string>({
      invalidatesTags: [CacheTag.ListFeesTypes],
      query: fees_type => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.add.feesType,
          params: { fees_type }
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
    updateBook: build.mutation<string, UpdateBook>({
      invalidatesTags: [CacheTag.ListBooks],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.book,
          body: params
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
    updateFeesType: build.mutation<string, UpdateFeesTypeRequest>({
      invalidatesTags: [CacheTag.ListFeesTypes],
      query: params => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.feesType,
          params
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
    updateProgramBook: build.mutation<string, CreateProgramBookRequest>({
      invalidatesTags: [CacheTag.ListProgramBooks],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.admin.update.programBook,
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
    })
  })
})

export const {
  useCreateAddonCourseMutation,
  useCreateBookMutation,
  useCreateFeesTypeMutation,
  useCreateLanguageMutation,
  useCreateProgramMutation,
  useCreateProgramAddonMutation,
  useCreateProgramBookMutation,
  useUpdateAddonCourseMutation,
  useUpdateAddonCourseStatusMutation,
  useUpdateBookMutation,
  useUpdateCollegeProfileMutation,
  useUpdateFeesTypeMutation,
  useUpdateLangugageMutation,
  useUpdateProgramMutation,
  useUpdateProgramAddonMutation,
  useUpdateProgramBookMutation,
  useCreateProgramSegmentMutation,
  useUpdateProgramStatusMutation,
  useUploadCollegeLogoMutation,
  useUpdateUserStatusMutation,
  useDeleteProgramBookMutation,
  useCreateUpdateAddressMutation,
  useCreateUpdateUserMutation,
  useCreateUpdateSectionMutation,
  useUpdateUserPermissionsMutation,
  useGetUserPermissionsQuery
} = adminServiceApi
