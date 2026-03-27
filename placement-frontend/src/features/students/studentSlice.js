import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../services/axios'
import { toastSuccess, toastError } from '../../utils/toast'

const initialState = {
  resumeUrl: null,
  status: 'idle',
  error: null,
}

export const uploadResume = createAsyncThunk(
  'students/uploadResume',
  async ({ file, userId }, { rejectWithValue }) => {
    try {
      const form = new FormData()
      form.append('resume', file)
      if (userId) form.append('userId', userId)
      const res = await api.post('/api/v1/student/upload-resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.resumeUrl =
          action.payload?.resumeUrl || action.payload?.url || null
        toastSuccess('Resume uploaded')
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Resume upload failed')
      })
  },
})

export default studentSlice.reducer

