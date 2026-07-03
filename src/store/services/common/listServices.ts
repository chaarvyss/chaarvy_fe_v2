import { urlConstants } from 'src/constants/urlConstants'
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
      providesTags: [CommonCacheTag.BENFICERY_TYPES_LIST],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.benificeryTypesUrl
        }
      }
    }),
    getExpenseCategoryTypesList: build.query<ExpenseCategoryType[], void>({
      providesTags: [CommonCacheTag.EXPENSE_CATEGORIES_LIST],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.expenseCategoryTypesUrl
        }
      }
    }),
    getVendorsList: build.query<VendorsListResponse, FilterProps>({
      providesTags: [CommonCacheTag.VENDORS_LIST],
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.vendorsUrl,
          params
        }
      }
    })
  })
})

export const {
  useGetExpensesListQuery,
  useGetBenificeryTypesListQuery,
  useGetExpenseCategoryTypesListQuery,
  useGetVendorsListQuery
} = commonListServiceApi
