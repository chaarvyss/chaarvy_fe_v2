import { urlConstants } from 'src/constants/urlConstants'

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
    })
  })
})

export const { useRecordStudentAttendenceMutation } = attendenceServiceApi
