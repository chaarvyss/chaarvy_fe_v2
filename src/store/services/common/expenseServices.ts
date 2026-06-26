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
    })
  })
})

export const { useCreateUpdateExpenseMutation } = commonExpensesServiceApi
