import { combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage/session'

import permission from '../permissionSlice'
import api from '../services/api'

export const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['permission']
}

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  permission
})
