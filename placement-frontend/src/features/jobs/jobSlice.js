import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { jobAPI } from './jobAPI'
import { toastSuccess } from '../../utils/toast'

const initialState = {
  jobs: [],
  applicantsByJobId: {},
  myApplications: [],
  status: 'idle',
  error: null,
}

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobAPI.fetchAllJobs()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const postJob = createAsyncThunk(
  'jobs/postJob',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await jobAPI.postJob(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchApplicants = createAsyncThunk(
  'jobs/fetchApplicants',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await jobAPI.fetchJobApplicants(jobId)
      return { jobId, data: res.data }
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async ({ jobId }, { rejectWithValue }) => {
    try {
      const res = await jobAPI.applyToJob({ jobId })
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchMyApplications = createAsyncThunk(
  'jobs/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobAPI.fetchMyJobsApplied()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const updateApplicationStatus = createAsyncThunk(
  'jobs/updateApplicationStatus',
  async ({ applicationId, status, interviewDetails }, { rejectWithValue }) => {
    try {
      const res = await jobAPI.updateApplicationStatus({ applicationId, status, interviewDetails })
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await jobAPI.deleteJob(jobId)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await jobAPI.updateJob(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const rejected = (state, action) => {
      state.status = 'failed'
      state.error = action.payload?.message || action.error?.message
    }

    builder
      .addCase(fetchJobs.pending, pending)
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.jobs =
          action.payload?.jobs ||
          action.payload?.data ||
          action.payload ||
          []
      })
      .addCase(fetchJobs.rejected, rejected)

      .addCase(postJob.pending, pending)
      .addCase(postJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        toastSuccess('Job posted successfully')
        const created = action.payload?.job || action.payload?.data || null
        if (created) state.jobs = [created, ...state.jobs]
      })
      .addCase(postJob.rejected, rejected)

      .addCase(fetchApplicants.pending, pending)
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const applicants =
          action.payload?.data?.applicantsList ||
          action.payload?.data?.applicants ||
          action.payload?.data?.data ||
          action.payload?.data ||
          []
        state.applicantsByJobId[action.payload.jobId] = applicants
      })
      .addCase(fetchApplicants.rejected, rejected)

      .addCase(applyToJob.pending, pending)
      .addCase(applyToJob.fulfilled, (state) => {
        state.status = 'succeeded'
        toastSuccess('Applied successfully')
      })
      .addCase(applyToJob.rejected, rejected)

      .addCase(fetchMyApplications.pending, pending)
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.myApplications =
          Array.isArray(action.payload)
            ? action.payload
            : action.payload?.jobs || action.payload?.data || []
      })
      .addCase(fetchMyApplications.rejected, rejected)

      .addCase(updateApplicationStatus.pending, pending)
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updated = action.payload?.data
        const appId = updated?._id || updated?.id
        if (appId) {
          Object.keys(state.applicantsByJobId).forEach((jobId) => {
            state.applicantsByJobId[jobId] = (state.applicantsByJobId[jobId] || []).map((a) =>
              (a?._id || a?.id) === appId ? { ...a, ...updated } : a,
            )
          })
        }
        toastSuccess('Application status updated')
      })
      .addCase(updateApplicationStatus.rejected, rejected)

      .addCase(deleteJob.pending, pending)
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const jobId = action.meta?.arg
        if (jobId) {
          state.jobs = state.jobs.filter((j) => (j._id || j.id) !== jobId)
        }
        toastSuccess('Job deleted')
      })
      .addCase(deleteJob.rejected, rejected)

      .addCase(updateJob.pending, pending)
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updated = action.payload?.job || action.payload?.data || action.payload
        const id = updated?._id || updated?.id || updated?.jobId
        if (id) {
          state.jobs = state.jobs.map((j) => ((j._id || j.id) === id ? { ...j, ...updated } : j))
        }
        toastSuccess('Job updated')
      })
      .addCase(updateJob.rejected, rejected)
  },
})

export default jobSlice.reducer

