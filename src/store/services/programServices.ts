import { urlConstants } from 'src/constants/urlConstants'
import {
  ProgramAddonCourseResponse,
  ProgramSecondLanguagesResponse,
  ProgramSectionResponse,
  ProgramSegmentMediumBook
} from 'src/lib/types'
import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

type ProgramSecondLanguageRequest = {
  program_id: string
  languages: Array<string>
}

type ProgramSectionRequest = {
  program_id: string
  sections: Array<string>
}

export type CreateProgramBookRequest = CascadingSelectorState & {
  program_book_id?: string
  book_id: string
  quantity: number
  status: number
}

const programServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getProgramAddonList: build.query<ProgramAddonCourseResponse[], string>({
      providesTags: [CacheTag.ListProgramAddon],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.programAddon,
          params: { program_id }
        }
      }
    }),
    getPrgMedSegBooksList: build.query<ProgramSegmentMediumBook[], CascadingSelectorState>({
      providesTags: [CacheTag.ListProgramBooks],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.programSegmentMediumBooks,
          params
        }
      }
    }),
    getProgramSecondLanguagesList: build.query<ProgramSecondLanguagesResponse[], string>({
      providesTags: [CacheTag.ListProgramSecondLanguages],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSecondLanguages,
          params: { program_id }
        }
      }
    }),
    updateProgramSecondLanguagesList: build.mutation<string, ProgramSecondLanguageRequest>({
      invalidatesTags: [CacheTag.ListProgramSecondLanguages],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.updateProgramSecondLanguages,
          body: { ...body }
        }
      }
    }),

    getProgramMediumsList: build.query<ProgramSecondLanguagesResponse[], string>({
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramMediums,
          params: { program_id }
        }
      }
    }),
    updateProgramMediums: build.mutation<string, ProgramSecondLanguageRequest>({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.updateProgramMediums,
          body: { ...body }
        }
      }
    }),
    getProgramSectionList: build.query<ProgramSectionResponse[], string>({
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSections,
          params: { program_id }
        }
      }
    }),
    updateProgramSection: build.mutation<string, ProgramSectionRequest>({
      invalidatesTags: [CacheTag.ListProgramMediums],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.updateProgramSections,
          body: { ...body }
        }
      }
    }),

    createUpdateProgramBook: build.mutation<string, CreateProgramBookRequest[]>({
      invalidatesTags: [CacheTag.ListProgramBooks],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.createUpdateProgramBook,
          body
        }
      }
    })
  })
})

export const {
  useLazyGetProgramAddonListQuery,
  useLazyGetPrgMedSegBooksListQuery,
  useLazyGetProgramSecondLanguagesListQuery,
  useUpdateProgramSecondLanguagesListMutation,
  useLazyGetProgramMediumsListQuery,
  useGetProgramMediumsListQuery,
  useUpdateProgramMediumsMutation,
  useGetProgramSectionListQuery,
  useLazyGetProgramSectionListQuery,
  useUpdateProgramSectionMutation,
  useCreateUpdateProgramBookMutation
} = programServicesApi
