import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authAPI } from './authAPI'
import { toastSuccess } from '../../utils/toast'

const initialState = {
  user: null,
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null,
}

function persistAuth({ token, role }) {
  if (token) localStorage.setItem('token', token)
  if (role) localStorage.setItem('role', role)
}

function clearPersistedAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('studentId')
}

function extractToken(data) {
  return (
    data?.token ||
    data?.jwt ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.jwt ||
    null
  )
}

function normalizeCampusRole(role) {
  if (role === 'superuser') return 'admin'
  return role
}

export const studentRegister = createAsyncThunk(
  'auth/studentRegister',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authAPI.studentRegister(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const companyRegister = createAsyncThunk(
  'auth/companyRegister',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authAPI.companyRegister(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const campusLogin = createAsyncThunk(
  'auth/campusLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authAPI.campusLogin(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const companyLogin = createAsyncThunk(
  'auth/companyLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authAPI.companyLogin(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getCurrentUser()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.role = null
      state.token = null
      state.status = 'idle'
      state.error = null
      clearPersistedAuth()
      toastSuccess('Logged out')
    },
    setRole(state, action) {
      const r = normalizeCampusRole(action.payload)
      state.role = r
      if (r) localStorage.setItem('role', r)
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const rejected = (state, action) => {
      state.status = 'failed'
      const p = action.payload
      state.error = p?.msg || p?.message || action.error?.message
    }

    builder
      .addCase(studentRegister.pending, pending)
      .addCase(studentRegister.fulfilled, (state) => {
        state.status = 'succeeded'
        toastSuccess('Registered successfully. Please sign in.')
      })
      .addCase(studentRegister.rejected, rejected)

      .addCase(companyRegister.pending, pending)
      .addCase(companyRegister.fulfilled, (state) => {
        state.status = 'succeeded'
        toastSuccess('Company registered. You can sign in as a company.')
      })
      .addCase(companyRegister.rejected, rejected)

      .addCase(campusLogin.pending, pending)
      .addCase(campusLogin.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const token = extractToken(action.payload)
        const role = normalizeCampusRole(action.payload?.role) || 'student'
        state.token = token
        state.role = role
        persistAuth({ token, role })
        toastSuccess('Signed in successfully')
      })
      .addCase(campusLogin.rejected, rejected)

      .addCase(companyLogin.pending, pending)
      .addCase(companyLogin.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const token = extractToken(action.payload)
        const company = action.payload?.company
        state.token = token
        state.role = 'company'
        state.user = company ? { id: company.id, _id: company.id, ...company } : null
        persistAuth({ token, role: 'company' })
        toastSuccess('Signed in successfully')
      })
      .addCase(companyLogin.rejected, rejected)

      .addCase(getCurrentUser.pending, pending)
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const user = action.payload?.user || action.payload?.company || action.payload?.data || action.payload
        state.user = user
        const r = normalizeCampusRole(user?.role)
        if (r && state.role !== 'company') {
          state.role = r
          localStorage.setItem('role', r)
        }
        if (user?.id && state.role === 'student') {
          localStorage.setItem('studentId', user.id)
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.status = 'idle'
      })
  },
})

export const { logout, setRole } = authSlice.actions
export default authSlice.reducer
