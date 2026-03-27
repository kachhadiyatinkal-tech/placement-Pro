import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import analyticsService from '../../services/analyticsService'

const initialState = {
  overview: null,
  trends: [],
  companyStats: [],
  branchStats: [],
  loading: false,
  error: false,
  message: ''
}

export const fetchOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (_, thunkAPI) => {
    try {
      return await analyticsService.fetchOverview()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching overview')
    }
  }
)

export const fetchTrends = createAsyncThunk(
  'analytics/fetchTrends',
  async (_, thunkAPI) => {
    try {
      return await analyticsService.fetchTrends()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching trends')
    }
  }
)

export const fetchCompanyStats = createAsyncThunk(
  'analytics/fetchCompanyStats',
  async (_, thunkAPI) => {
    try {
      return await analyticsService.fetchCompanyStats()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching company stats')
    }
  }
)

export const fetchBranchStats = createAsyncThunk(
  'analytics/fetchBranchStats',
  async (_, thunkAPI) => {
    try {
      return await analyticsService.fetchBranchStats()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching branch stats')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    resetAnalytics: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false
        state.overview = action.payload
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.message = action.payload
      })
      // Trends
      .addCase(fetchTrends.pending, (state) => {
         state.loading = true
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.loading = false
        state.trends = action.payload
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.message = action.payload
      })
      // Company stats
      .addCase(fetchCompanyStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCompanyStats.fulfilled, (state, action) => {
        state.loading = false
        state.companyStats = action.payload
      })
      .addCase(fetchCompanyStats.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.message = action.payload
      })
      // Branch stats
      .addCase(fetchBranchStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBranchStats.fulfilled, (state, action) => {
        state.loading = false
        state.branchStats = action.payload
      })
      .addCase(fetchBranchStats.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.message = action.payload
      })
  }
})

export const { resetAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
