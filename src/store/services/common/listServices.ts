import { urlConstants } from 'src/constants/urlConstants'
import { FilterProps } from 'src/lib/interfaces'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { CommonCacheTag } from '../cacheTag'

const commonListServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getExpensesList: build.query<ExpensesListResponse, FilterProps>({
      providesTags: [CommonCacheTag.EXPENSES_LIST],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.expensesUrl,
          params
        }
      }
    }),
    getBenificeryTypesList: build.query<BenificeryType[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.benificeryTypesUrl
        }
      }
    }),
    getExpenseCategoryTypesList: build.query<ExpenseCategoryType[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.expenseCategoryTypesUrl
        }
      }
    })
  })
})

export const { useGetExpensesListQuery, useGetBenificeryTypesListQuery, useGetExpenseCategoryTypesListQuery } =
  commonListServiceApi
