import { combineReducers } from '@reduxjs/toolkit'
import { encryptTransform } from 'redux-persist-transform-encrypt'

import permission from '../permissionSlice'
import api from '../services/api'
import storage from '../storage'

const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'chaarvy-offline-cache-secret-key-12345',
  onError: function (error) {
    console.error('Encryption Error:', error)
  }
})

export const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['permission'],
  transforms: [encryptor]
}

import chatReducer from './chatSlice'

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  permission,
  chat: chatReducer
})
