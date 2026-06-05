import { combineReducers } from '@reduxjs/toolkit'

import permission from '../permissionSlice'
import api from '../services/api'
import storage from '../storage'

export const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['permission']
}

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  permission
})
