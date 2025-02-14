import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { UsersListResponse } from 'src/lib/interfaces'
import { HttpRequestMethods } from '..'
import { AddOnCourse, Community, Gender, Language, Occupation, Program, QualifiedExam, Religions } from 'src/lib/types'
import { CacheTag } from './cacheTag'

const listServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getUsersList: build.query<UsersListResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.users
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
    getAddonCoursesList: build.query<AddOnCourse[], boolean>({
      query: onlyActive => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.addOnCourse,
          params: { onlyActive }
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
    getFeesTypesList: build.query<Community[], void>({
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
    })
  })
})

export const {
  useLazyGetUsersListQuery,
  useLazyGetProgramsListQuery,
  useGetAddonCoursesListQuery,
  useGetCommunitiesListQuery,
  useGetFeesTypesListQuery,
  useGetGendersListQuery,
  useGetLanguagesListQuery,
  useGetOccupationsListQuery,
  useGetQualifiedExamsListQuery,
  useGetReligionsListQuery,
  useGetUsersListQuery
} = listServicesApi
