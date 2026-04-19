import { api } from '../axios'

export const adminAPI = {
  getManagementUsers: (params) => api.get('/api/v1/admin/management-users', { params }),
  addManagementUser: (payload) => api.post('/api/v1/admin/management-add-user', payload),
  deleteManagementUser: (payload) => api.post('/api/v1/admin/management-delete-user', payload),

  getTpoUsers: (params) => api.get('/api/v1/admin/tpo-users', { params }),
  addTpoUser: (payload) => api.post('/api/v1/admin/tpo-add-user', payload),
  deleteTpoUser: (payload) => api.post('/api/v1/admin/tpo-delete-user', payload),

  getStudentUsers: (params) => api.get('/api/v1/admin/student-users', { params }),
  addStudentUser: (payload) => api.post('/api/v1/admin/student-add-user', payload),
  deleteStudentUser: (payload) => api.post('/api/v1/admin/student-delete-user', payload),
  approveStudent: (payload) => api.post('/api/v1/admin/student-approve', payload),
  setUserActive: (payload) => api.post('/api/v1/admin/user-set-active', payload),
  setCompanyActive: (payload) => api.post('/api/v1/admin/company-set-active', payload),
  updateUser: (payload) => api.post('/api/v1/admin/user-update', payload),
  updateCompany: (payload) => api.post('/api/v1/admin/company-update', payload),
  updateCompanyRegistrationStatus: (payload) => api.post('/api/v1/company/update-registration-status', payload),
}
