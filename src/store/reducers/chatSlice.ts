import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ChatState {
  onlineUsers: Record<string, boolean>
}

const initialState: ChatState = {
  onlineUsers: {}
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUserOnlineStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.isOnline
    },
    setMultipleUsersOnline: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(userId => {
        state.onlineUsers[userId] = true
      })
    }
  }
})

export const { setUserOnlineStatus, setMultipleUsersOnline } = chatSlice.actions
export default chatSlice.reducer
