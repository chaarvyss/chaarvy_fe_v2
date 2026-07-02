import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { CommonCacheTag } from '../cacheTag'

const commonExpensesServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createUpdateExpense: build.mutation<AddExpenseResponse, ExpenseRequest>({
      invalidatesTags: [CommonCacheTag.EXPENSES_LIST, CommonCacheTag.EXPENSES_DETAIL],
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
      providesTags: [CommonCacheTag.EXPENSES_DETAIL],
      keepUnusedDataFor: 0,
      query: expense_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.expenses.getExpenseDetailUrl,
          params: { expense_id }
        }
      }
    }),
    generateExpenseUploadUrls: build.mutation<GenerateUploadUrlsResponse[], GenerateUploadUrlsRequest>({
      invalidatesTags: [CommonCacheTag.EXPENSES_DETAIL],
      query: ({ expense_id, file_names }) => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.expenses.generateUploadUrls(expense_id),
          body: { expense_id, file_names }
        }
      }
    }),
    getExpenseFiles: build.query<GetExpenseFilesResponse, string>({
      providesTags: [CommonCacheTag.EXPENSES_DETAIL],
      keepUnusedDataFor: 0,
      query: expenseId => ({
        url: urlConstants.common.expenses.getExpenseFilesUrl(expenseId),
        method: HttpRequestMethods.GET
      })
    }),
    deleteExpenseFiles: build.mutation<{ message: string }, DeleteExpenseFilesRequest>({
      invalidatesTags: [CommonCacheTag.EXPENSES_DETAIL],
      query: body => ({
        url: urlConstants.common.expenses.deleteExpenseFilesUrl(body.expense_id),
        method: HttpRequestMethods.DELETE,
        body: { file_ids: body.file_ids }
      })
    })
  })
})

export const {
  useCreateUpdateExpenseMutation,
  useCreateUpdateBenficeryTypeMutation,
  useCreateUpdateExpenseCategoryTypeMutation,
  useCreateUpdatePaymentModeMutation,
  useGetExpenseDetailQuery,
  useGenerateExpenseUploadUrlsMutation,
  useGetExpenseFilesQuery,
  useDeleteExpenseFilesMutation
} = commonExpensesServiceApi
