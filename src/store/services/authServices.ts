import { urlConstants } from 'src/constants/urlConstants'
import { ChangePasswordProps, LoginProps, LoginResponse } from 'src/lib/interfaces'

import { httpHeaders, HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export type ProfilePicUploadRequest = {
  user_id: string
  photo: File
}

type ResetPasswordRequest = {
  clcode: string
  username: string
  password: string
}

type VerifyResetCodeRequest = {
  clcode: string
  username: string
  verification_code: string
}

type ResetLinkRequest = {
  clcode: string
  username: string
}

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
    }),
    uploadProfilePic: build.mutation<string, ProfilePicUploadRequest>({
      invalidatesTags: [CacheTag.User],
      query: ({ user_id, photo }) => {
        const formData = new FormData()
        formData.append('file', photo)

        return {
          body: formData,
          method: HttpRequestMethods.POST,
          url: urlConstants.auth.updateProfilePic,
          params: { user_id }
        }
      }
    }),
    resetPassword: build.mutation<void, ResetPasswordRequest>({
      query: body => {
        return {
          url: '',
          headers: { [httpHeaders.CLCODE]: body.clcode },
          method: HttpRequestMethods.POST,
          body
        }
      }
    }),
    verifyResetCode: build.mutation<void, VerifyResetCodeRequest>({
      query: () => {
        return {
          url: '',
          method: HttpRequestMethods.POST
        }
      }
    }),

    requestResetCode: build.query<void, ResetLinkRequest>({
      query: ({ username, clcode }) => {
        return {
          url: '',
          method: HttpRequestMethods.GET,
          headers: { [httpHeaders.CLCODE]: clcode },
          params: { username }
        }
      }
    })
  }),
  overrideExisting: true
})

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useUploadProfilePicMutation,
  useResetPasswordMutation,
  useVerifyResetCodeMutation,
  useLazyRequestResetCodeQuery
} = authServiceApi
