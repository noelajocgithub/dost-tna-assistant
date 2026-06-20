import api from './client'

// Form image attachments (e.g. organizational structure chart).
export const attachmentsApi = {
  upload: (formId, type, file) => {
    const fd = new FormData()
    fd.append('type', type)
    fd.append('file', file)
    return api
      .post(`/forms/${formId}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // Fetch a stored file with the bearer token and expose it as an object URL
  // (an <img src> can't carry the Authorization header on its own).
  blobUrl: (formId, attachmentId) =>
    api
      .get(`/forms/${formId}/attachments/${attachmentId}`, { responseType: 'blob' })
      .then((r) => URL.createObjectURL(r.data)),

  remove: (formId, attachmentId) =>
    api.delete(`/forms/${formId}/attachments/${attachmentId}`).then((r) => r.data),
}
