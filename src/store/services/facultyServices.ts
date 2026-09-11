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

interface QuestionType {
  id: string
  question_type: string
  marks: number
}

interface GetTopicsListRequest {
  program_id: string
  segment_id: string
  subject_id: string
}

interface GetQuestionsRequest extends GetTopicsListRequest {
  topic_id: string
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
    getQuestionTypes: build.query<QuestionType[], void>({
      query: () => {
        return {
          url: urlConstants.faculty.getQuestionTypesUrl
        }
      }
    }),
    getQuestions: build.query<QuestionType[], GetQuestionsRequest>({
      query: params => {
        return {
          url: urlConstants.faculty.getQuestionsUrl,
          params
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
    }),
    translateText: build.mutation<Record<string, string>, { text: string; target_languages: string[] }>({
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.google.translateTextUrl,
        body
      })
    })
  })
})

export const {
  useGetTopicsListQuery,
  useCreateUpdateTopicMutation,
  useGetQuestionTypesQuery,
  useGetQuestionsQuery,
  useTranslateTextMutation
} = facultyServiceApi
