import { urlConstants } from 'src/constants/urlConstants'
import { LoginProps, LoginResponse } from 'src/lib/interfaces'

import { ContentTypes, httpHeaders, HttpRequestMethods } from '..'

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
    })
  })
})

export const { useLoginMutation } = authServiceApi
