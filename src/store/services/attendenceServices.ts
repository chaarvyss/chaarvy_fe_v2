import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

const attendenceServiceApi = api.injectEndpoints({
  endpoints: build => ({
    recordStudentAttendence: build.mutation<string, RecordStudentAttendenceRequest>({
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.attendence.recordStudentAttendenceUrl,
          body: { ...body }
        }
      }
    }),
    getStudentsList: build.query<GetActiveStudentsListResponse[], GetActiveStudentsListRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.attendence.getStudentsListUrl,
          params: { ...params }
        }
      }
    }),
    getCurrentClassDetails: build.query<CurrentClassDetailsResponse, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.attendence.getCurrentClassDetailsUrl
        }
      }
    }),
    getAttendenceByLogId: build.query<GetAttendenceByLogIdResponse, string>({
      query: attendance_log_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.attendence.getStudentAttendenceByLogIdUrl,
          params: { attendance_log_id }
        }
      }
    }),
    getStudentAttendenceLogs: build.query<GetStudentAttendenceLogsResponse, GetStudentAttendenceLogsRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.attendence.getStudentAttendenceLogsUrl,
          params: { ...params }
        }
      }
    }),
    finalizeAttendence: build.mutation<string, string>({
      query: attendance_log_id => {
        return {
          method: HttpRequestMethods.PUT,
          url: urlConstants.attendence.putFinalizeAttendenceUrl,
          params: { attendance_log_id }
        }
      }
    })
  })
})

export const {
  useRecordStudentAttendenceMutation,
  useGetStudentsListQuery,
  useGetCurrentClassDetailsQuery,
  useGetAttendenceByLogIdQuery,
  useGetStudentAttendenceLogsQuery,
  useFinalizeAttendenceMutation
} = attendenceServiceApi
