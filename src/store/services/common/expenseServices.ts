import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { CommonCacheTag } from '../cacheTag'

const commonExpensesServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createUpdateExpense: build.mutation<string, ExpenseRequest>({
      invalidatesTags: [CommonCacheTag.EXPENSES_LIST],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.expenses.createUpdateExpenseUrl,
          body
        }
      }
    }),
    createUpdateBenficeryType: build.mutation<string, BenficeryTypeRequest>({
      invalidatesTags: [CommonCacheTag.BENFICERY_TYPES_LIST],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.expenses.createUpdateBenficeryTypeUrl,
          body
        }
      }
    }),
    createUpdateExpenseCategoryType: build.mutation<string, ExpenseCategoryRequest>({
      invalidatesTags: [CommonCacheTag.EXPENSE_CATEGORIES_LIST],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.expenses.createUpdateExpenseCategoryTypeUrl,
          body
        }
      }
    }),
    createUpdatePaymentMode: build.mutation<string, PaymentModeRequest>({
      invalidatesTags: [CommonCacheTag.PAYMENT_MODES],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.expenses.createUpdatePaymentModeUrl,
          body
        }
      }
    }),
    getExpenseDetail: build.query<ExpenseRequest, string>({
      query: expense_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.expenses.getExpenseDetailUrl,
          params: { expense_id }
        }
      }
    })
  })
})

export const {
  useCreateUpdateExpenseMutation,
  useCreateUpdateBenficeryTypeMutation,
  useCreateUpdateExpenseCategoryTypeMutation,
  useCreateUpdatePaymentModeMutation,
  useGetExpenseDetailQuery
} = commonExpensesServiceApi
