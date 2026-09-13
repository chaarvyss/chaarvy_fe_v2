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
  subject_id?: string
  search?: string
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

export type TopicScheduleResponse = {
  id: string
  topic_id: string
  topic_name: string
  user_id?: string
  date: string
  period_id: string
  period_title?: string
  program_id: string
  program_name?: string
  segment_id: string
  segment_name?: string
  subject_id?: string
  subject_name?: string
  medium_id?: string
  section_id?: string
  section_name?: string
  status: number
  completed_on?: string | null
  completed: boolean
}

export type CreateUpdateTopicScheduleRequest = {
  id?: string
  topic_id: string
  date: string
  period_id: string
  program_id: string
  segment_id: string
  medium_id?: string
  section_id?: string
  status?: number
  faculty_id?: string
  user_id?: string
}

export type DeleteTopicScheduleRequest = {
  schedule_id: string
}

export interface GetTopicSchedulesRequest {
  program_id?: string
  segment_id?: string
  start_date?: string
  end_date?: string
  faculty_id?: string
  user_id?: string
}

const facultyServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getTopicsList: build.query<Topic[], GetTopicsListRequest>({
      providesTags: [CacheTag.SubjectTopics],
      query: ({ program_id, segment_id, subject_id, search }) => {
        return {
          url: urlConstants.faculty.getTopicsListUrl,
          params: {
            program_id,
            segment_id,
            subject_id,
            search
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
    }),
    getTopicSchedules: build.query<TopicScheduleResponse[], GetTopicSchedulesRequest | void>({
      providesTags: [CacheTag.FacultyTopicSchedule],
      query: params => ({
        url: urlConstants.faculty.getTopicSchedulesUrl,
        params: params || {}
      })
    }),
    createUpdateTopicSchedule: build.mutation<{ message: string; id?: string }, CreateUpdateTopicScheduleRequest>({
      invalidatesTags: [CacheTag.FacultyTopicSchedule],
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.faculty.createUpdateTopicScheduleUrl,
        body
      })
    }),
    deleteTopicSchedule: build.mutation<{ message: string }, DeleteTopicScheduleRequest>({
      invalidatesTags: [CacheTag.FacultyTopicSchedule],
      query: body => ({
        method: HttpRequestMethods.POST,
        url: urlConstants.faculty.deleteTopicScheduleUrl,
        body
      })
    }),
    getFacultyTimetable: build.query<FacultyTimetableData[], { faculty_id?: string; user_id?: string } | void>({
      providesTags: [CacheTag.ClassTimetable],
      query: params => ({
        url: urlConstants.faculty.getFacultyTimetableUrl,
        params: params || {}
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
  useTranslateTextMutation,
  useGetTopicSchedulesQuery,
  useCreateUpdateTopicScheduleMutation,
  useDeleteTopicScheduleMutation,
  useGetFacultyTimetableQuery
} = facultyServiceApi
