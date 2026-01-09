import { urlConstants } from 'src/constants/urlConstants'
import { PlacedField } from 'src/pages/templateDesigner/types'

import { HttpRequestMethods } from '..'

import api from './api'

type Template = {
  label: string
  placedFields: PlacedField[]
  availableFields: {
    id: string
    key: string
    type: string
    label: string
  }[]
}

export type TemplatesResponse = Record<string, Template>

const templateServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getAvailableTemplates: build.query<TemplatesResponse, void>({
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.templates.getAvilableTemplates
        }
      }
    }),
    updateAvailableTemplates: build.mutation<void, TemplatesResponse>({
      query: templates => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.templates.updateAvailableTemplates,
          body: templates
        }
      }
    })
  })
})

export const { useGetAvailableTemplatesQuery, useUpdateAvailableTemplatesMutation } = templateServicesApi
