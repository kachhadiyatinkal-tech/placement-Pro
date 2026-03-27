import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { managementAPI } from '../../services/api/managementAPI'
import { toastError, toastSuccess } from '../../utils/toast'

const initialState = {
  tpoUsers: [],
  notices: [],
  studentsData: [],
  notifyInterviewHired: [],
  status: 'idle',
  error: null,
}

export const fetchTpoUsers = createAsyncThunk(
  'management/fetchTpoUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await managementAPI.getTpoUsers()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const addTpo = createAsyncThunk(
  'management/addTpo',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.addTpo(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const addManagement = createAsyncThunk(
  'management/addManagement',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.addManagement(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const addStudent = createAsyncThunk(
  'management/addStudent',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.addStudent(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const deleteTpo = createAsyncThunk(
  'management/deleteTpo',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.deleteTpo(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const sendNotice = createAsyncThunk(
  'management/sendNotice',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.sendNotice(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchAllNotices = createAsyncThunk(
  'management/fetchAllNotices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await managementAPI.getAllNotices()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const deleteNotice = createAsyncThunk(
  'management/deleteNotice',
  async (noticeId, { rejectWithValue }) => {
    try {
      const res = await managementAPI.deleteNotice(noticeId)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const updateNotice = createAsyncThunk(
  'management/updateNotice',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managementAPI.updateNotice(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchAllStudentsData = createAsyncThunk(
  'management/fetchAllStudentsData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await managementAPI.getAllStudentsData()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchNotifyInterviewHired = createAsyncThunk(
  'management/fetchNotifyInterviewHired',
  async (_, { rejectWithValue }) => {
    try {
      const res = await managementAPI.getNotifyInterviewHired()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const managementSlice = createSlice({
  name: 'management',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handleRejected = (state, action) => {
      state.status = 'failed'
      const msg = action.payload?.msg || action.payload?.message || action.error?.message
      toastError(msg || 'Request failed')
    }

    builder
      .addCase(fetchTpoUsers.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(fetchTpoUsers.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.tpoUsers = a.payload?.tpoUsers || []
      })
      .addCase(fetchTpoUsers.rejected, handleRejected)

      .addCase(addTpo.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'TPO added successfully')
      })
      .addCase(addTpo.rejected, handleRejected)

      .addCase(addManagement.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Management user added successfully')
      })
      .addCase(addManagement.rejected, handleRejected)

      .addCase(addStudent.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Student added successfully')
      })
      .addCase(addStudent.rejected, handleRejected)

      .addCase(deleteTpo.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'TPO deleted')
      })
      .addCase(deleteTpo.rejected, handleRejected)

      .addCase(sendNotice.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Notice sent')
      })
      .addCase(sendNotice.rejected, handleRejected)

      .addCase(fetchAllNotices.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.notices = Array.isArray(a.payload) ? a.payload : []
      })
      .addCase(fetchAllNotices.rejected, handleRejected)

      .addCase(deleteNotice.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Notice deleted')
      })
      .addCase(deleteNotice.rejected, handleRejected)

      .addCase(updateNotice.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Notice updated')
      })
      .addCase(updateNotice.rejected, handleRejected)
  },
})

export default managementSlice.reducer
