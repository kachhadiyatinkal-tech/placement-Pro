import { api } from '../../services/axios'

export const companyAPI = {
  fetchJobs: (companyId) => api.get(`/api/v1/tpo/jobs${companyId ? `?companyId=${companyId}` : ''}`),
  postJob: (payload) => api.post('/api/v1/tpo/post-job', payload),
  updateJob: (payload) => {
    const { jobId, _id, ...rest } = payload
    return api.post('/api/v1/tpo/post-job', { ...rest, _id: _id || jobId })
  },
  deleteJob: (jobId) => api.post('/api/v1/tpo/delete-job', { jobId }),
  getJob: (jobId) => api.get(`/api/v1/tpo/job/${jobId}`),
  fetchApplicants: (jobId) => api.get(`/api/applications/job/${jobId}`),
  updateApplicationStatus: ({ applicationId, status, interviewDetails }) =>
    api.put(`/api/applications/${applicationId}/status`, { status, interviewDetails }),
}

