import api from './client'

export const evaluationsApi = {
  list: (params = {}) =>
    api.get('/evaluations', { params }).then((r) => r.data),
  get: (id, mode) =>
    api.get(`/evaluations/${id}`, { params: mode ? { mode } : {} }).then((r) => r.data),
  comment: (id, sectionKey, comment, action) =>
    api
      .post(`/evaluations/${id}/comment`, {
        section_key: sectionKey,
        comment,
        action,
      })
      .then((r) => r.data),
  overall: (id, action, comment) =>
    api
      .post(`/evaluations/${id}/overall`, { action, comment })
      .then((r) => r.data),
}
