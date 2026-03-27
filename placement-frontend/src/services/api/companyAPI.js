import { api } from '../axios'

export const companyAPI = {
  getAllCompanies: (params) => api.get('/api/v1/company/company-detail', { params }),
  addCompany: (payload) => api.post('/api/v1/company/add-company', payload),
  deleteCompany: (companyId) => api.post('/api/v1/company/delete-company', { companyId }),
}
