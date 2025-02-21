import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

type CreateBook = {
  book_name: string
  pages: number
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
  quantity: number
}

type updateAddonCourse = {
  id: string
  addon_course_name: string
}

type UpdateBook = CreateBook & {
  book_id: string
}

type UpdateProgramRequest = {
  id?: string
  program_name: string
}

type UpdateFeesTypeRequest = {
  id?: string
  fees_type: string
}

type ProgramSegmentRequest = {
  id?: string
  program_id: string
  segment_id: string
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
    })
  })
})

export const {
  useCreateAddonCourseMutation,
  useCreateBookMutation,
  useCreateFeesTypeMutation,
  useCreateProgramMutation,
  useCreateProgramAddonMutation,
  useCreateProgramBookMutation,
  useUpdateAddonCourseMutation,
  useUpdateAddonCourseStatusMutation,
  useUpdateBookMutation,
  useUpdateFeesTypeMutation,
  useUpdateProgramMutation,
  useUpdateProgramAddonMutation,
  useUpdateProgramBookMutation,
  useCreateProgramSegmentMutation,
  useUpdateProgramStatusMutation
} = adminServiceApi
