import { combineReducers } from '@reduxjs/toolkit'

import permission from '../permissionSlice'
import api from '../services/api'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  permission
})

export default rootReducer
