import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

type CreateBook = {
  book_name: string
  pages: number
  price: number
}

type CreateProgramBookRequest = {
  program_book_id?: string
  program_id: string
  segment_id: string
  book_id: string
  quantity: number
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
  useCreateBookMutation,
  useCreateFeesTypeMutation,
  useCreateProgramMutation,
  useCreateProgramBookMutation,
  useUpdateBookMutation,
  useUpdateFeesTypeMutation,
  useUpdateProgramMutation,
  useUpdateProgramBookMutation,
  useCreateProgramSegmentMutation,
  useUpdateProgramStatusMutation
} = adminServiceApi
