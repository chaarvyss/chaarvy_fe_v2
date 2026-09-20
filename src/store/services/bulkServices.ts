import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'
import {
  BooksUploadResponse,
  BooksValidationResponse,
  BulkTemplateParams,
  StudentUploadResponse,
  StudentValidationResponse,
  UploadMode
} from 'src/store/types/bulk'

import api from './api'

const bulkServiceApi = api.injectEndpoints({
  endpoints: build => ({
    downloadStudentsTemplate: build.mutation<Blob, BulkTemplateParams | void>({
      query: params => ({
        url: urlConstants.bulk.downloadStudentsTemplate,
        method: HttpRequestMethods.GET,
        params: params || {},
        responseHandler: response => response.blob()
      })
    }),

    validateStudents: build.mutation<StudentValidationResponse, FormData>({
      query: formData => ({
        url: urlConstants.bulk.validateStudents,
        method: HttpRequestMethods.POST,
        body: formData
      })
    }),

    uploadStudents: build.mutation<StudentUploadResponse, { formData: FormData; mode?: UploadMode }>({
      query: ({ formData, mode = 'skip_errors' }) => ({
        url: urlConstants.bulk.uploadStudents,
        method: HttpRequestMethods.POST,
        params: { mode },
        body: formData
      })
    }),

    downloadStudentsErrorSheet: build.mutation<Blob, FormData>({
      query: formData => ({
        url: urlConstants.bulk.downloadStudentsErrorSheet,
        method: HttpRequestMethods.POST,
        body: formData,
        responseHandler: response => response.blob()
      })
    }),

    downloadBooksTemplate: build.mutation<Blob, BulkTemplateParams | void>({
      query: params => ({
        url: urlConstants.bulk.downloadBooksTemplate,
        method: HttpRequestMethods.GET,
        params: params || {},
        responseHandler: response => response.blob()
      })
    }),

    validateBooks: build.mutation<BooksValidationResponse, FormData>({
      query: formData => ({
        url: urlConstants.bulk.validateBooks,
        method: HttpRequestMethods.POST,
        body: formData
      })
    }),

    uploadBooks: build.mutation<BooksUploadResponse, { formData: FormData; mode?: UploadMode }>({
      query: ({ formData, mode = 'skip_errors' }) => ({
        url: urlConstants.bulk.uploadBooks,
        method: HttpRequestMethods.POST,
        params: { mode },
        body: formData
      })
    }),

    downloadBooksErrorSheet: build.mutation<Blob, FormData>({
      query: formData => ({
        url: urlConstants.bulk.downloadBooksErrorSheet,
        method: HttpRequestMethods.POST,
        body: formData,
        responseHandler: response => response.blob()
      })
    })
  })
})

export const {
  useDownloadStudentsTemplateMutation,
  useValidateStudentsMutation,
  useUploadStudentsMutation,
  useDownloadStudentsErrorSheetMutation,
  useDownloadBooksTemplateMutation,
  useValidateBooksMutation,
  useUploadBooksMutation,
  useDownloadBooksErrorSheetMutation
} = bulkServiceApi

export default bulkServiceApi
