import api from './api'
import { HttpRequestMethods } from '..'
import { urlConstants } from 'src/constants/urlConstants'

interface StationaryStockResponse {
  book_name: string
  available_quantity: string
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
    })
  })
})

export const { useGetLowStationaryStockDetailsQuery } = adminServiceApi
