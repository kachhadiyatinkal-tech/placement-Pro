import { api } from '../../services/axios'

export const jobAPI = {
  // TPO / Company (shared endpoints)
  fetchAllJobs: () => api.get('/api/v1/tpo/jobs'),
  postJob: (payload) => api.post('/api/v1/tpo/post-job', payload),
  updateJob: (payload) => {
    const { jobId, _id, ...rest } = payload
    return api.post('/api/v1/tpo/post-job', { ...rest, _id: _id || jobId })
  },
  deleteJob: (jobId) => api.post('/api/v1/tpo/delete-job', { jobId }),
  fetchJobApplicants: (jobId) => api.get(`/api/applications/job/${jobId}`),
  fetchAllApplications: () => api.get('/api/applications/all'),


  // Student
  applyToJob: ({ jobId, ...payload }) => api.post(`/api/applications/apply/${jobId}`, payload),
  fetchMyJobsApplied: () => api.get('/api/applications/student'),
  updateApplicationStatus: ({ applicationId, status, interviewDetails }) =>
    api.put(`/api/applications/${applicationId}/status`, { status, interviewDetails }),
}

