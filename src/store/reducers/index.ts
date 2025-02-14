import { combineReducers } from '@reduxjs/toolkit'

import api from '../services/api'

import permission from '../permissionSlice'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  permission
})

export default rootReducer
