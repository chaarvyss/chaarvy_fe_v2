import { urlConstants } from 'src/constants/urlConstants'
import api from './api'
import { LoginProps, LoginResponse } from 'src/lib/interfaces'
import { ContentTypes, httpHeaders, HttpRequestMethods } from '..'

const authServiceApi = api.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginProps>({
      query: ({ username, password, clcode }) => {
        return {
          body: { username, password },
          headers: { [httpHeaders.CONTENT_TYPE]: ContentTypes.JSON, [httpHeaders.CLCODE]: clcode },
          method: HttpRequestMethods.POST,
          url: urlConstants.auth.login
        }
      }
    })
  })
})

export const { useLoginMutation } = authServiceApi
