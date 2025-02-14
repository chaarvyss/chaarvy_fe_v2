import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { UsersListResponse } from 'src/lib/interfaces'
import { HttpRequestMethods } from '..'
import { Program } from 'src/lib/types'

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
    getProgramsList: build.query<Program[], { active_only?: boolean }>({
      query: active_only => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.list.programs,
          params: { active_only }
        }
      }
    })
  })
})

export const { useLazyGetUsersListQuery, useLazyGetProgramsListQuery } = listServicesApi
