import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PermissionSlice {
  data: Array<string>
}

const initialState: PermissionSlice = {
  data: []
}

const PermissionSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAvailablePermissionsData: (state, action: PayloadAction<Array<string>>) => {
      state.data = action.payload
    },
    resetAvailablePermissions: state => {
      state.data = []
    }
  }
})

export const { setAvailablePermissionsData, resetAvailablePermissions } = PermissionSlice.actions
export default PermissionSlice.reducer
