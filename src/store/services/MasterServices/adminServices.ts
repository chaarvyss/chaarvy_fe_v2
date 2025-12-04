import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { MasterCacheTag } from '../cacheTag'

interface ClientRequestData {
  client_id?: string
  client_name: string
  db_name: string
  college_name: string
  college_code: string
  processing_fees: number
  contact_numbers: string
  email_id: string
}

export interface ClientsResponse {
  client_id: string
  client_name: string
  college_name: string
  college_code: string
  inst_type: string
  processing_fees: number
  contact_numbers: string
  db_name: string
  email_id: string
}

const adminServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getClientsList: build.query<ClientsResponse[], void>({
      providesTags: [MasterCacheTag.ClientsList],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.master.admin.clientsList
        }
      }
    }),
    createClient: build.mutation<string, ClientRequestData>({
      invalidatesTags: [MasterCacheTag.ClientsList],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.master.admin.addClient,
          body
        }
      }
    })
  })
})

export const { useGetClientsListQuery, useCreateClientMutation } = adminServiceApi
