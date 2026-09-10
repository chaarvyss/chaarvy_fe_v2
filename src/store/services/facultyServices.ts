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

export type CreateUpdateQuestionRequest = {
  question_id?: string
  program_id: string
  segment_id: string
  subject_id: string
  topic_id: string
  question_type: string
  question_title: Record<string, string>
  options?: Record<string, string[]> | null
  correct_option?: Record<string, string> | null
}

export type BulkDeleteQuestionsRequest = {
  question_ids: string[]
}

export type BulkUpdateQuestionTypeRequest = {
  question_ids: string[]
  question_type: string
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
    getQuestions: build.query<any[], GetQuestionsRequest>({
      providesTags: [CacheTag.TopicQuestions],
      query: params => {
        return {
          url: urlConstants.faculty.getQuestionsUrl,
          params
        }
      }
    }),
    createUpdateQuestion: build.mutation<{ message: string }, CreateUpdateQuestionRequest>({
      invalidatesTags: [CacheTag.TopicQuestions, CacheTag.SubjectTopics],
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.faculty.createUpdateQuestionUrl,
        body
      })
    }),
    bulkDeleteQuestions: build.mutation<{ message: string }, BulkDeleteQuestionsRequest>({
      invalidatesTags: [CacheTag.TopicQuestions, CacheTag.SubjectTopics],
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.faculty.bulkDeleteQuestionsUrl,
        body
      })
    }),
    bulkUpdateQuestionType: build.mutation<{ message: string }, BulkUpdateQuestionTypeRequest>({
      invalidatesTags: [CacheTag.TopicQuestions],
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.faculty.bulkUpdateQuestionTypeUrl,
        body
      })
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
  useCreateUpdateQuestionMutation,
  useBulkDeleteQuestionsMutation,
  useBulkUpdateQuestionTypeMutation,
  useTranslateTextMutation
} = facultyServiceApi
