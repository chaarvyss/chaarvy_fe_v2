import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

const reportServiceApi = api.injectEndpoints({
  endpoints: build => ({
    studentAdmissionsReport: build.mutation({
      query: status_ => ({
        url: urlConstants.reports.studentAdmissionsReport,
        method: HttpRequestMethods.GET,
        params: { ...(status_ ? { status_ } : {}) },
        responseHandler: response => response.blob()
      })
    })
  })
})

export const { useStudentAdmissionsReportMutation } = reportServiceApi
