import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { MasterCacheTag } from '../cacheTag'

type VideoResponse = {
  id: string
  title: string
  course: string
  duration: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  uploadDate: string
}

const helpServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getAllHelpVideos: build.query<VideoResponse[], void>({
      providesTags: [MasterCacheTag.HelpVideos],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.master.help.getAllVideos
        }
      }
    }),
    requestUploadUrl: build.mutation<{ videoId: string; uploadUrl: string }, any>({
      query: payload => ({
        url: urlConstants.master.help.getUploadUrl,
        method: HttpRequestMethods.POST,
        body: payload
      })
    })
  })
})

export const { useGetAllHelpVideosQuery, useRequestUploadUrlMutation } = helpServiceApi
