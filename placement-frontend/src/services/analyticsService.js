import { api } from './axios'

const fetchOverview = async () => {
  const response = await api.get('/api/analytics/overview')
  // our backend sendSuccess returns { success: true, ...payload }
  // so we return the payload directly
  return response.data
}

const fetchTrends = async () => {
  const response = await api.get('/api/analytics/placement-trends')
  // our backend sendSuccess returns { success: true, trends: [...] }
  return response.data.trends || []
}

const fetchCompanyStats = async () => {
  const response = await api.get('/api/analytics/company-stats')
  // our backend sendSuccess returns { success: true, stats: [...] }
  return response.data.stats || []
}

const fetchBranchStats = async () => {
  const response = await api.get('/api/analytics/branch-stats')
  // our backend sendSuccess returns { success: true, stats: [...] }
  return response.data.stats || []
}

const analyticsService = {
  fetchOverview,
  fetchTrends,
  fetchCompanyStats,
  fetchBranchStats
}

export default analyticsService
