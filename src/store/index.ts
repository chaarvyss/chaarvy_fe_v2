import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'

import { rootReducer, persistConfig } from './reducers'
import api from './services/api'

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  devTools: true,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
  reducer: persistedReducer
})
export const persistor = persistStore(store)

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
