import { urlConstants } from 'src/constants/urlConstants'
import {
  ProgramSegmentMediumsListResponse,
  ProgramSecondLanguagesResponse,
  ProgramSectionResponse,
  ProgramSegmentMediumBook
} from 'src/lib/types'
import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import { BulkProcessResponse } from 'src/views/common/BulkProcessStatusModal'

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

export type CreateUpdateProgramSegmentMedium = {
  program_section_id?: string
  program_id: string
  segment_id: string
  segment_name: string
  medium_id: string
  medium_name: string
  medium_status: number
}

export type CreateUpdateProgramSegmentSection = {
  program_section_id?: string
  program_id: string
  section_id: string
  segment_id: string
  medium_id: string
  seating_capacity: number
}

type ProgramSegmentMediumsListByProgramIdRequest = {
  program_id: string
  only_active: boolean
}

export type ProgramMediumRequest = {
  program_id: string
  medium_id?: string
}

export type ProgramFeesSegmentHeaderDataResponse = {
  segment_id: string
  segment_name: string
  sequence: number
  color: string
  mediums: {
    medium_id: string
    medium_name: string
    sequence: number
    color: string
    sections: {
      section_id: string
      section_name: string
      sequence: number
      color: string
    }[]
  }[]
}

const programServicesApi = api.injectEndpoints({
  endpoints: build => ({
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
    getProgramSegmentMediumsListByProgramId: build.query<
      ProgramSegmentMediumsListResponse[],
      ProgramSegmentMediumsListByProgramIdRequest
    >({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSegmentMediumsByProgramId,
          params
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
    getProgramSectionList: build.query<ProgramSectionResponse[], ProgramMediumRequest>({
      providesTags: [CacheTag.ListProgramSegmentSections],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSections,
          params
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
    createUpdateProgramBook: build.mutation<BulkProcessResponse, CreateProgramBookRequest[]>({
      invalidatesTags: [CacheTag.ListProgramBooks],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.createUpdateProgramBook,
          body
        }
      }
    }),
    createUpdateProgramSegmentMedium: build.mutation<BulkProcessResponse, CreateUpdateProgramSegmentMedium[]>({
      invalidatesTags: [CacheTag.ListProgramSegmentMediums],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.createUpdateProgramSegmentMedium,
          body
        }
      }
    }),
    getProgramSegmentMediumsList: build.query<CreateUpdateProgramSegmentMedium[], string>({
      providesTags: [CacheTag.ListProgramSegmentMediums],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSegmentMediums,
          params: { program_id }
        }
      }
    }),
    createUpdateProgramSegmentSection: build.mutation<string, CreateUpdateProgramSegmentSection[]>({
      invalidatesTags: [CacheTag.ListProgramSegmentSections],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.program.createUpdateProgramSegmentSection,
          body
        }
      }
    }),
    getProgramFeesHeaderData: build.query<ProgramFeesSegmentHeaderDataResponse[], string>({
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramFeesHeaderDataUrl,
          params: { program_id }
        }
      }
    }),
    getProgramSegmentSubjectsList: build.query<ProgramSegmentSubject[], ProgramSegmentSubjectsListRequest | undefined>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getProgramSegmentSubjectsListUrl,
          params
        }
      }
    }),

    getAllProgramSegmentsList: build.query<ProgramSegment[], string | void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.program.getAllProgramSegmentsUrl
        }
      }
    })
  })
})

export const {
  useLazyGetPrgMedSegBooksListQuery,
  useLazyGetProgramSecondLanguagesListQuery,
  useUpdateProgramSecondLanguagesListMutation,
  useGetProgramSegmentMediumsListByProgramIdQuery,
  useLazyGetProgramSegmentMediumsListByProgramIdQuery,
  useUpdateProgramMediumsMutation,
  useGetProgramSectionListQuery,
  useLazyGetProgramSectionListQuery,
  useUpdateProgramSectionMutation,
  useCreateUpdateProgramBookMutation,
  useCreateUpdateProgramSegmentMediumMutation,
  useGetProgramSegmentMediumsListQuery,
  useCreateUpdateProgramSegmentSectionMutation,
  useGetProgramFeesHeaderDataQuery,
  useGetProgramSegmentSubjectsListQuery,
  useGetAllProgramSegmentsListQuery
} = programServicesApi
