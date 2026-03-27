import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { companyAPI } from '../../services/api/companyAPI'
import { toastError, toastSuccess } from '../../utils/toast'

const initialState = {
  companies: [],
  status: 'idle',
  error: null,
}

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const res = await companyAPI.getAllCompanies()
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const addCompany = createAsyncThunk(
  'companies/addCompany',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await companyAPI.addCompany(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await companyAPI.deleteCompany(companyId)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err?.message })
    }
  },
)

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handleRejected = (state, action) => {
      state.status = 'failed'
      const msg = action.payload?.msg || action.payload?.message || action.error?.message
      toastError(msg || 'Request failed')
    }

    builder
      .addCase(fetchCompanies.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(fetchCompanies.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.companies = a.payload?.companys || a.payload?.companies || []
      })
      .addCase(fetchCompanies.rejected, handleRejected)

      .addCase(addCompany.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Company added successfully')
      })
      .addCase(addCompany.rejected, handleRejected)

      .addCase(deleteCompany.fulfilled, (s, a) => {
        toastSuccess(a.payload?.msg || 'Company deleted')
      })
      .addCase(deleteCompany.rejected, handleRejected)
  },
})

export default companiesSlice.reducer
