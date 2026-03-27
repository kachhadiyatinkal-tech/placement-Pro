import { api } from '../../services/axios'

export const authAPI = {
  studentRegister: (payload) => api.post('/api/v1/student/signup', payload),
  /** Company self-registration */
  companyRegister: (payload) => api.post('/api/v1/company/signup', payload),

  /** Single login for student, TPO, management, and admin (users collection). */
  campusLogin: (payload) => api.post('/api/v1/user/login', payload),

  companyLogin: (payload) => api.post('/api/v1/company/login', payload),

  getCurrentUser: () => {
    const role = localStorage.getItem('role')
    if (role === 'company') {
      return api.get('/api/v1/company/my-profile')
    }
    return api.get('/api/v1/user/detail')
  },
}
