import api from './client'

export const formsApi = {
  list: () => api.get('/forms').then((r) => r.data),
  create: (enterpriseName) =>
    api.post('/forms', { enterprise_name: enterpriseName }).then((r) => r.data),
  get: (id) => api.get(`/forms/${id}`).then((r) => r.data),
  saveSection: (id, sectionKey, data) =>
    api
      .put(`/forms/${id}/section`, { section_key: sectionKey, data })
      .then((r) => r.data),
  submit: (id) => api.post(`/forms/${id}/submit`).then((r) => r.data),
  requestDeletion: (id, reason) =>
    api.post(`/forms/${id}/request-deletion`, { reason }).then((r) => r.data),
  cancelDeletion: (id) =>
    api.post(`/forms/${id}/cancel-deletion`).then((r) => r.data),
  download: async (id, format) => {
    const res = await api.get(`/forms/${id}/export/${format}`, {
      responseType: 'blob',
    })
    const disposition = res.headers['content-disposition'] || ''
    const match = disposition.match(/filename=([^;]+)/)
    const filename = match ? match[1].trim() : `tna-form.${format}`
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
