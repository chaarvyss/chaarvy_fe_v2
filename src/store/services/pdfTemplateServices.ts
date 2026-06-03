import { urlConstants } from 'src/constants/urlConstants'

import { HttpRequestMethods } from '..'

import api from './api'
import { CacheTag } from './cacheTag'

const pdfTemplateApi = api.injectEndpoints({
  endpoints: build => ({
    getPdfTemplates: build.query<PdfTemplate[], void>({
      providesTags: [CacheTag.PDFTemplates],
      query: () => {
        return {
          method: HttpRequestMethods.GET,
          url: urlConstants.template.pdfTemplates
        }
      }
    }),
    addUpdatePdfTemplate: build.mutation<string, PdfTemplate>({
      invalidatesTags: [CacheTag.PDFTemplates],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.template.addUpdatePdfTemplateUrl,
          body
        }
      }
    })
  }),
  overrideExisting: false
})

export const { useGetPdfTemplatesQuery, useAddUpdatePdfTemplateMutation } = pdfTemplateApi
