import { urlConstants } from 'src/constants/urlConstants'
import {
  ProgramAddonCourseResponse,
  ProgramBookRequest,
  ProgramBooksDetails,
  ProgramSecondLanguagesResponse,
  ProgramSectionResponse
} from 'src/lib/types'

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
    getProgramBooksList: build.query<ProgramBooksDetails, ProgramBookRequest>({
      providesTags: [CacheTag.ListProgramBooks],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.programBooks,
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
    })
  })
})

export const {
  useLazyGetProgramAddonListQuery,
  useLazyGetProgramBooksListQuery,
  useLazyGetProgramSecondLanguagesListQuery,
  useUpdateProgramSecondLanguagesListMutation,
  useLazyGetProgramMediumsListQuery,
  useUpdateProgramMediumsMutation,
  useLazyGetProgramSectionListQuery,
  useUpdateProgramSectionMutation
} = programServicesApi
