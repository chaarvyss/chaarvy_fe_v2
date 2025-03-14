import { urlConstants } from 'src/constants/urlConstants'
import {
  PaymentModes,
  PaymentsListRequest,
  PaymentsListResponse,
  UsersListRequest,
  UsersListResponse
} from 'src/lib/interfaces'
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
  ProgramAddonCourseResponse,
  ProgramBooksDetails,
  QualifiedExam,
  Religions,
  RolesListResponse,
  Segment,
  State
} from 'src/lib/types'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

const listServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getAddonCoursesList: build.query<AddOnCourse[], boolean>({
      providesTags: [CacheTag.ListAddonCourse],
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
          url: urlConstants.list.districts,
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
    getRolesList: build.query<RolesListResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.roles
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
      providesTags: [CacheTag.ListLanguages],
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
    getUsersList: build.query<UsersListResponse, UsersListRequest | undefined>({
      providesTags: [CacheTag.ListUsers],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.users,
          params
        }
      }
    }),
    getPaymentModesList: build.query<PaymentModes[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.paymentModes
        }
      }
    }),
    getPaymentsList: build.query<PaymentsListResponse, PaymentsListRequest | undefined>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.studentPaymentsList,
          params
        }
      }
    })
  })
})

export const {
  useGetSegmentsListQuery,
  useGetBooksListQuery,
  useGetProgramsListQuery,
  useGetAddonCoursesListQuery,
  useGetCommunitiesListQuery,
  useLazyGetDistrictsListQuery,
  useLazyGetFeesTypesListQuery,
  useGetGendersListQuery,
  useGetLanguagesListQuery,
  useGetOccupationsListQuery,
  useLazyGetProgramsListQuery,
  useGetQualifiedExamsListQuery,
  useGetReligionsListQuery,
  useGetStateListQuery,
  useLazyGetUsersListQuery,
  useGetPaymentModesListQuery,
  useLazyGetPaymentsListQuery,
  useGetRolesListQuery
} = listServicesApi
