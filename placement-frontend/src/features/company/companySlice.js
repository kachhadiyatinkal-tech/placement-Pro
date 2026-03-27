import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { companyAPI } from './companyAPI'
import { toastError, toastSuccess } from '../../utils/toast'

const initialState = {
  jobs: [],
  applicantsByJobId: {},
  stats: {
    totalJobs: 0,
    totalApplicants: 0,
    activeJobs: 0,
    closedJobs: 0,
  },
  recentApplicants: [],
  latestJobs: [],
  status: 'idle',
  error: null,
}

export const fetchCompanyJobs = createAsyncThunk(
  'company/fetchCompanyJobs',
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await companyAPI.fetchJobs(companyId)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const postCompanyJob = createAsyncThunk(
  'company/postCompanyJob',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyAPI.postJob(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const deleteCompanyJob = createAsyncThunk(
  'company/deleteCompanyJob',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyAPI.deleteJob(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const updateCompanyJob = createAsyncThunk(
  'company/updateCompanyJob',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyAPI.updateJob(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const fetchCompanyApplicants = createAsyncThunk(
  'company/fetchCompanyApplicants',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await companyAPI.fetchApplicants(jobId)
      return { jobId, data: res.data }
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const updateCompanyApplicationStatus = createAsyncThunk(
  'company/updateCompanyApplicationStatus',
  async ({ applicationId, status, interviewDetails }, { rejectWithValue }) => {
    try {
      const res = await companyAPI.updateApplicationStatus({ applicationId, status, interviewDetails })
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCompanyJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const jobs =
          action.payload?.jobs ||
          action.payload?.data ||
          action.payload ||
          []
        state.jobs = jobs

        const totalJobs = jobs.length
        const activeJobs = jobs.filter(
          (j) =>
            (j.status || j.jobStatus || '').toLowerCase() === 'active' ||
            !j.status,
        ).length
        const closedJobs = totalJobs - activeJobs

        state.stats = {
          ...state.stats,
          totalJobs,
          activeJobs,
          closedJobs,
        }

        state.latestJobs = jobs.slice(0, 5)
      })
      .addCase(fetchCompanyJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to fetch company jobs')
      })

      .addCase(postCompanyJob.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(postCompanyJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const job = action.payload?.job || action.payload?.data || null
        if (job) state.jobs = [job, ...state.jobs]
        state.stats.totalJobs = state.jobs.length
        toastSuccess('Job posted successfully')
      })
      .addCase(postCompanyJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to post job')
      })

      .addCase(deleteCompanyJob.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteCompanyJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const deletedId =
          action.meta?.arg?.jobId ||
          action.payload?._id ||
          action.payload?.id ||
          null
        if (deletedId) {
          state.jobs = state.jobs.filter(
            (j) => (j._id || j.id) !== deletedId,
          )
        }
        state.stats.totalJobs = state.jobs.length
        toastSuccess('Job deleted')
      })
      .addCase(deleteCompanyJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to delete job')
      })

      .addCase(updateCompanyJob.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateCompanyJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updated = action.payload?.job || action.payload?.data || action.payload
        const id = updated?._id || updated?.id || updated?.jobId
        if (id) {
          state.jobs = state.jobs.map((j) => ((j._id || j.id) === id ? { ...j, ...updated } : j))
        }
        toastSuccess('Job updated successfully')
      })
      .addCase(updateCompanyJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to update job')
      })

      .addCase(fetchCompanyApplicants.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCompanyApplicants.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const applicants =
          action.payload?.data?.applicantsList ||
          action.payload?.data?.applicants ||
          action.payload?.data?.data ||
          action.payload?.data ||
          []
        const jobId = action.payload.jobId
        state.applicantsByJobId[jobId] = applicants

        state.recentApplicants = applicants.slice(0, 5)
        state.stats.totalApplicants = applicants.length
      })
      .addCase(fetchCompanyApplicants.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to fetch applicants')
      })

      .addCase(updateCompanyApplicationStatus.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateCompanyApplicationStatus.fulfilled, (state, action) => {
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
      .addCase(updateCompanyApplicationStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error?.message
        toastError(state.error || 'Failed to update application status')
      })
  },
})

export default companySlice.reducer

