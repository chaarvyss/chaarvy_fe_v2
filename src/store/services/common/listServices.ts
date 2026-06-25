import { urlConstants } from 'src/constants/urlConstants'
import { FilterProps } from 'src/lib/interfaces'
import { HttpRequestMethods } from 'src/store'

import api from '../api'

export type ProfilePicUploadRequest = {
  user_id: string
  photo: File
}

const commonListServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getExpensesList: build.query<ExpensesListResponse, FilterProps>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.common.list.expensesUrl,
          params
        }
      }
    })
  })
})

export const { useGetExpensesListQuery } = commonListServiceApi
