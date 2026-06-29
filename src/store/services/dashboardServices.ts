import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

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

type DateRange = {
  startDate: string
  endDate: string
}

type CashflowRequest = DateRange & {
  unit: 'week' | 'month' | 'year'
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
    }),

    getCashflowDetails: build.query<FinancialRecord[], CashflowRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.cashflowDetailsUrl,
          params
        }
      }
    }),
    getExpenses: build.query<ExpenseRecord[], DateRange>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.dashboard.expensesDetailsUrl,
          params
        }
      }
    })
  })
})

export const {
  useGetLowStationaryStockDetailsQuery,
  useGetStudentEnrollmentCountDetailsQuery,
  useGetStudentsCountQuery,
  useGetPaymentsCountQuery,
  useGetCashflowDetailsQuery,
  useGetExpensesQuery
} = adminServiceApi
