import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { UsersListResponse } from 'src/lib/interfaces'
import { HttpRequestMethods } from '..'
import {
  AddOnCourse,
  BooksTypesResponse,
  Community,
  District,
  Fees,
  FeesTypesResponse,
  Gender,
  Language,
  Occupation,
  Program,
  ProgramBooksDetails,
  QualifiedExam,
  Religions,
  Segment,
  State
} from 'src/lib/types'
import { CacheTag } from './cacheTag'

const listServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getAddonCoursesList: build.query<AddOnCourse[], boolean>({
      query: onlyActive => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.addOnCourse,
          params: { onlyActive }
        }
      }
    }),
    getBooksList: build.query<BooksTypesResponse[], void>({
      providesTags: [CacheTag.ListBooks],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.books
        }
      }
    }),
    getCommunitiesList: build.query<Community[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.communities
        }
      }
    }),
    getDistrictsList: build.query<District[], string>({
      query: state_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.communities,
          params: { state_id }
        }
      }
    }),
    getFeesTypesList: build.query<FeesTypesResponse[], void>({
      providesTags: [CacheTag.ListFeesTypes],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.feesTypes
        }
      }
    }),
    getGendersList: build.query<Gender[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.genders
        }
      }
    }),
    getLanguagesList: build.query<Language[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.languages
        }
      }
    }),
    getOccupationsList: build.query<Occupation[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.occupations
        }
      }
    }),
    getProgramsList: build.query<Program[], boolean>({
      providesTags: [CacheTag.ListPrograms],
      query: active_only => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.programs,
          params: { active_only }
        }
      }
    }),

    getProgramBooksList: build.query<ProgramBooksDetails, string>({
      providesTags: [CacheTag.ListProgramBooks],
      query: program_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.programBooks,
          params: { program_id }
        }
      }
    }),
    getQualifiedExamsList: build.query<QualifiedExam[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.qualifiedExams
        }
      }
    }),
    getReligionsList: build.query<Religions[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.religions
        }
      }
    }),
    getSegmentsList: build.query<Segment[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.segments
        }
      }
    }),
    getStateList: build.query<State[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.states
        }
      }
    }),
    getUsersList: build.query<UsersListResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.users
        }
      }
    })
  })
})

export const {
  useGetSegmentsListQuery,
  useGetBooksListQuery,
  useGetProgramsListQuery,
  useLazyGetAddonCoursesListQuery,
  useLazyGetCommunitiesListQuery,
  useLazyGetDistrictsListQuery,
  useLazyGetFeesTypesListQuery,
  useLazyGetGendersListQuery,
  useLazyGetLanguagesListQuery,
  useLazyGetOccupationsListQuery,
  useLazyGetProgramBooksListQuery,
  useLazyGetProgramsListQuery,
  useLazyGetQualifiedExamsListQuery,
  useLazyGetReligionsListQuery,
  useLazyGetStateListQuery,
  useLazyGetUsersListQuery
} = listServicesApi
