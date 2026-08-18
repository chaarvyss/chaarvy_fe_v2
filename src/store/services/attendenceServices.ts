import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

const attendenceServiceApi = api.injectEndpoints({
  endpoints: build => ({
    recordStudentAttendence: build.mutation<any, any>({
      query: body => {
        return {
          method: 'POST',
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
    })
  })
})

export const { useRecordStudentAttendenceMutation, useGetStudentsListQuery } = attendenceServiceApi
