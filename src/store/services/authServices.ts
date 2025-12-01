import { urlConstants } from 'src/constants/urlConstants'
import { ChangePasswordProps, LoginProps, LoginResponse } from 'src/lib/interfaces'

import { httpHeaders, HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export type ProfilePicUploadRequest = {
  user_id: string
  photo: File
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
    })
  })
})

export const { useLoginMutation, useChangePasswordMutation, useUploadProfilePicMutation } = authServiceApi
