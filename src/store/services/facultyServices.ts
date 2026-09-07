import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

export type CreateUpdateTopicRequest = {
  topic_id?: string
  topic_name: string
  program_id: string
  segment_id: string
  subject_id: string
  description?: string
}

interface Topic {
  topic_id: string
  description?: string
  total_questions: number
  topic_name: string
}

interface GetTopicsListRequest {
  program_id: string
  segment_id: string
  subject_id?: string
}

const facultyServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getTopicsList: build.query<Topic[], GetTopicsListRequest>({
      providesTags: [CacheTag.SubjectTopics],
      query: ({ program_id, segment_id, subject_id }) => {
        return {
          url: urlConstants.faculty.getTopicsListUrl,
          params: {
            program_id,
            segment_id,
            subject_id
          }
        }
      }
    }),
    createUpdateTopic: build.mutation<string, CreateUpdateTopicRequest>({
      invalidatesTags: [CacheTag.SubjectTopics],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.faculty.createUpdateTopicUrl,
          body
        }
      }
    })
  })
})

export const { useGetTopicsListQuery, useCreateUpdateTopicMutation } = facultyServiceApi
