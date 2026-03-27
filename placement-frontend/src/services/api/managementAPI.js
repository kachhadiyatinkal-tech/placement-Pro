import { api } from '../axios'

export const managementAPI = {
  // TPO users
  getTpoUsers: () => api.get('/api/v1/management/tpo-users'),

  // Add users
  addTpo: (payload) => api.post('/api/v1/management/addtpo', payload),
  addManagement: (payload) => api.post('/api/v1/management/add-management', payload),
  addStudent: (payload) => api.post('/api/v1/management/add-student', payload),

  // Delete TPO
  deleteTpo: (payload) => api.post('/api/v1/management/deletetpo', payload),

  // Notices
  sendNotice: (payload) => {
    // Support both JSON and multipart/form-data (for PDF/image attachments).
    if (payload instanceof FormData) {
      return api.post('/api/v1/management/send-notice', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post('/api/v1/management/send-notice', payload)
  },
  getAllNotices: () => api.get('/api/v1/management/get-all-notices'),
  getNoticesByReceiver: (receiverRole) =>
    api.get('/api/v1/management/get-notices', { params: { receiver_role: receiverRole } }),
  deleteNotice: (noticeId) => api.post(`/api/v1/management/delete-notice?noticeId=${noticeId}`),
  updateNotice: (payload) => api.post('/api/v1/management/update-notice', payload),

  // Student data (year/branch)
  getAllStudentsData: () => api.get('/api/v1/student/all-students-data-year-and-branch'),
  getNotifyInterviewHired: () => api.get('/api/v1/student/notify-interview-hired'),
}
