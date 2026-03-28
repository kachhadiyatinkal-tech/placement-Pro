import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/axios'
import { toast } from 'react-toastify'

export const applyJob = createAsyncThunk(
  'applications/applyJob',
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/applications/apply/${jobId}`, applicationData || {})
      toast.success('Successfully applied for the job!')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to apply')
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const fetchStudentApplications = createAsyncThunk(
  'applications/fetchStudentApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/applications/student')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const fetchApplicantsByJob = createAsyncThunk(
  'applications/fetchApplicantsByJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/applications/job/${jobId}`)
      return { jobId, data: response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const updateStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, interviewDetails }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/applications/status/${id}`, { status, interviewDetails })
      toast.success('Application status updated!')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update status')
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const scheduleInterview = createAsyncThunk(
  'applications/scheduleInterview',
  async ({ id, interviewDate, interviewLink }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/applications/schedule-interview/${id}`, { interviewDate, interviewLink })
      toast.success('Interview scheduled!')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to schedule interview')
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const uploadOfferLetter = createAsyncThunk(
  'applications/uploadOfferLetter',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('offerLetter', file)
      const response = await api.put(`/api/applications/upload-offer/${id}`, formData)
      toast.success('Offer letter uploaded!')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to upload offer letter')
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)

export const respondToOffer = createAsyncThunk(
  'applications/respondToOffer',
  async ({ id, isAccepted }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/applications/respond-offer/${id}`, { isAccepted })
      toast.success(isAccepted ? 'Offer Accepted!' : 'Offer Rejected')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to respond to offer')
      return rejectWithValue(error.response?.data?.msg)
    }
  }
)


const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    applicantsByJob: {},
    selectedApplication: null,
    loading: false,
    error: null
  },
  reducers: {
    clearApplications: (state) => {
      state.applications = []
      state.applicantsByJob = {}
      state.selectedApplication = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Student Applications
      .addCase(fetchStudentApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Applicants By Job
      .addCase(fetchApplicantsByJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApplicantsByJob.fulfilled, (state, action) => {
        state.loading = false;
        state.applicantsByJob[action.payload.jobId] = action.payload.data;
      })
      .addCase(fetchApplicantsByJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateStatus.fulfilled, (state, action) => {
         const updatedApp = action.payload;
         // update in applications if present
         const index = state.applications.findIndex(a => a._id === updatedApp._id)
         if(index !== -1) state.applications[index] = updatedApp
         // update in applicantsByJob if present
         if (state.applicantsByJob[updatedApp.jobId]) {
           const idx = state.applicantsByJob[updatedApp.jobId].findIndex(a => a._id === updatedApp._id)
           if (idx !== -1) state.applicantsByJob[updatedApp.jobId][idx] = updatedApp
         }
      })
      // Schedule Interview
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        const updatedApp = action.payload;
        if (state.applicantsByJob[updatedApp.jobId]) {
          const idx = state.applicantsByJob[updatedApp.jobId].findIndex(a => a._id === updatedApp._id)
          if (idx !== -1) state.applicantsByJob[updatedApp.jobId][idx] = updatedApp
        }
      })
      // Respond to offer
      .addCase(respondToOffer.fulfilled, (state, action) => {
        const updatedApp = action.payload;
        const index = state.applications.findIndex(a => a._id === updatedApp._id)
        if(index !== -1) state.applications[index] = updatedApp
      })
      // Upload Offer letter
      .addCase(uploadOfferLetter.fulfilled, (state, action) => {
        const updatedApp = action.payload;
        if (state.applicantsByJob[updatedApp.jobId]) {
          const idx = state.applicantsByJob[updatedApp.jobId].findIndex(a => a._id === updatedApp._id)
          if (idx !== -1) state.applicantsByJob[updatedApp.jobId][idx] = updatedApp
        }
      })
  }
})

export const { clearApplications } = applicationSlice.actions
export default applicationSlice.reducer
