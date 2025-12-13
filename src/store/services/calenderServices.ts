import { urlConstants } from 'src/constants/urlConstants'

import api from './api'

interface CalenderEvent {
  id: string
  summary: string
  start: string
  end: string
}

const calenderServices = api.injectEndpoints({
  endpoints: build => ({
    getGoogleAuthUrl: build.query<{ auth_url: string }, void>({
      query: () => {
        return {
          url: urlConstants.calender.integrate
        }
      }
    }),
    integrationCallback: build.query<string, string>({
      query: code => {
        return {
          url: urlConstants.calender.integrateCallback,
          params: { code }
        }
      }
    }),
    getEventsList: build.query<CalenderEvent[], string>({
      query: calendar_id => {
        return {
          url: urlConstants.calender.eventsList,
          params: { calendar_id }
        }
      }
    })
  })
})

export const { useLazyGetGoogleAuthUrlQuery, useLazyIntegrationCallbackQuery, useLazyGetEventsListQuery } =
  calenderServices
