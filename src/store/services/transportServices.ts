import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'

interface VehicleDetailsResponse {
  vehicle_id: string
  vehicle_number: string
  driver_name: string
  driver_contact: string
  route: string
  students_onboard: number
  current_location: string
}

interface RoutePointsWithTimes {
  point_name: string
  morning_arrival_time: string
  morning_departure_time: string
  evening_arrival_time: string
  evening_departure_time: string
}

interface RouteDetailsResponse {
  route_id: string
  route_name: string
  points_with_time: RoutePointsWithTimes[]
}

const viewServiceApi = api.injectEndpoints({
  endpoints: build => ({
    getVehicleDetails: build.query<VehicleDetailsResponse, string>({
      query: vehicle_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.viewVehicleDetails,
          params: { vehicle_id }
        }
      }
    }),
    getRouteDetails: build.query<RouteDetailsResponse, string>({
      query: route_id => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.view.viewRouteDetails,
          params: { route_id }
        }
      }
    })
  }),

  overrideExisting: true
})

export const { useGetVehicleDetailsQuery, useGetRouteDetailsQuery } = viewServiceApi
