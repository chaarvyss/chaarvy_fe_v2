import { urlConstants } from 'src/constants/urlConstants'
import { ChangePasswordProps, LoginProps, LoginResponse } from 'src/lib/interfaces'

import { httpHeaders, HttpRequestMethods } from '..'

import api from './api'

const authServiceApi = api.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginProps>({
      query: ({ username, password, clcode }) => {
        return {
          body: { username, password },
          headers: { [httpHeaders.CLCODE]: clcode },
          method: HttpRequestMethods.POST,
          url: urlConstants.auth.login
        }
      }
    }),
    changePassword: build.mutation<string, ChangePasswordProps>({
      query: body => {
        return {
          body,
          method: HttpRequestMethods.POST,
          url: urlConstants.auth.changePassword
        }
      }
    })
  })
})

export const { useLoginMutation, useChangePasswordMutation } = authServiceApi
