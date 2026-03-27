import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { managementAPI } from '../../services/api/managementAPI'

const initialState = {
  notices: [],
  status: 'idle',
  error: null,
}

export const fetchNoticesByRole = createAsyncThunk(
  'notices/fetchNoticesByRole',
  async (receiverRole, { rejectWithValue }) => {
    try {
      const res = await managementAPI.getNoticesByReceiver(receiverRole)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const noticesSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoticesByRole.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchNoticesByRole.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.notices = Array.isArray(a.payload) ? a.payload : []
      })
      .addCase(fetchNoticesByRole.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.payload?.msg || a.payload?.message || a.error?.message
      })
  },
})

export default noticesSlice.reducer
