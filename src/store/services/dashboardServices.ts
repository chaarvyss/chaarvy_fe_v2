import api from './api'
import { HttpRequestMethods } from '..'
import { urlConstants } from 'src/constants/urlConstants'

interface StationaryStockResponse {
  book_name: string
  available_quantity: string
}

export type StudentData = {
  [course: string]: {
    [segment: string]: {
      [medium: string]: {
        section: {
          [section: string]: { Male: number; Female: number }
        }
      }
    }
  }
}

const adminServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getLowStationaryStockDetails: build.query<StationaryStockResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.lowStationaryStockDetails
        }
      }
    }),
    getStudentEnrollmentCountDetails: build.query<StudentData, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.studentEnrollmentCountDetails
        }
      }
    }),
    getStudentsCount: build.query<Array<number>, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.studentsCount
        }
      }
    }),
    getPaymentsCount: build.query<any, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.paymentCountDetails
        }
      }
    })
  })
})

export const {
  useGetLowStationaryStockDetailsQuery,
  useGetStudentEnrollmentCountDetailsQuery,
  useGetStudentsCountQuery,
  useGetPaymentsCountQuery
} = adminServiceApi
