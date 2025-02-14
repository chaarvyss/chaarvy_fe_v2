import { configureStore } from '@reduxjs/toolkit'

import rootReducer from './reducers'
import api from './services/api'

const store = configureStore({
  devTools: true,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  reducer: rootReducer
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export enum HttpRequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum httpHeaders {
  ACCEPT = 'Accept',
  CONTENT_TYPE = 'Content-Type',
  CLCODE = 'clcode'
}

export enum ContentTypes {
  JSON = 'application/json',
  TEXT = 'text/plain',
  FORM_URL_ENCODED = 'application/x-www-form-urlencoded'
}
