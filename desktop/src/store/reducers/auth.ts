import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  member: {
    id: number
    name: string
    email: string
  } | null
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  member: JSON.parse(localStorage.getItem('member') || 'null')
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string, member: AuthState['member'] }>) => {
      state.token = action.payload.token
      state.member = action.payload.member
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('member', JSON.stringify(action.payload.member))
    },
    logout: (state) => {
      state.token = null
      state.member = null
      localStorage.removeItem('token')
      localStorage.removeItem('member')
    }
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer