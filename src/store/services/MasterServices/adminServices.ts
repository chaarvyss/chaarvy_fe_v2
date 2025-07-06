import { HttpRequestMethods } from 'src/store'
import api from '../api'
import { urlConstants } from 'src/constants/urlConstants'

export interface ClientsResponse {
  client_id: string
  client_name: string
  college_name: string
  college_code: string
  inst_type: string
  processing_fees: number
  db_name: string
}

const adminServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getClientsList: build.query<ClientsResponse[], void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.master.admin.clientsList
        }
      }
    })
  })
})

export const { useGetClientsListQuery } = adminServiceApi
