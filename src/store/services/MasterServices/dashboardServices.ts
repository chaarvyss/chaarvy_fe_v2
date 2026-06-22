import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'

const dashboardServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getDashClientStats: build.query<DashClientsResponse[], DashClientsRequest>({
      query: params => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.master.dashboard.clientStats,
          params
        }
      }
    })
  })
})

export const { useGetDashClientStatsQuery } = dashboardServiceApi
