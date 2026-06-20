import api from './client'

export const adminApi = {
  listUsers: () => api.get('/admin/users').then((r) => r.data),
  createUser: (payload) => api.post('/admin/users', payload).then((r) => r.data),
  updateUser: (id, payload) =>
    api.put(`/admin/users/${id}`, payload).then((r) => r.data),
  getAiConfig: () => api.get('/admin/ai-config').then((r) => r.data),
  saveAiConfig: (payload) =>
    api.put('/admin/ai-config', payload).then((r) => r.data),
  testAiConfig: (payload) =>
    api.post('/admin/ai-config/test', payload).then((r) => r.data),
  ollamaModels: (baseUrl) =>
    api
      .get('/admin/ai-config/ollama-models', { params: { base_url: baseUrl } })
      .then((r) => r.data),
  deletionRequests: () =>
    api.get('/admin/deletion-requests').then((r) => r.data),
  approveDeletion: (id) =>
    api.post(`/admin/deletion-requests/${id}/approve`).then((r) => r.data),
  rejectDeletion: (id) =>
    api.post(`/admin/deletion-requests/${id}/reject`).then((r) => r.data),
  activityLogs: (params = {}) =>
    api.get('/admin/activity-logs', { params }).then((r) => r.data),
}
