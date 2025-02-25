import { urlConstants } from 'src/constants/urlConstants'
import { ProgramAddonCourseResponse, ProgramBooksDetails, ProgramSecondLanguagesResponse } from 'src/lib/types'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

type ProgramSecondLanguageRequest = {
  program_id: string
  languages: Array<string>
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
    getProgramBooksList: build.query<ProgramBooksDetails, string>({
      providesTags: [CacheTag.ListProgramBooks],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.programBooks,
          params: { program_id }
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
      providesTags: [CacheTag.ListProgramMediums],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramMediums,
          params: { program_id }
        }
      }
    }),
    updateProgramMediums: build.mutation<string, ProgramSecondLanguageRequest>({
      invalidatesTags: [CacheTag.ListProgramMediums],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.updateProgramMediums,
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
  useUpdateProgramMediumsMutation
} = programServicesApi
