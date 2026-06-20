import api from './client'

export const aiApi = {
  prompts: () => api.get('/ai/prompts').then((r) => r.data),
  assist: (section, context, instruction) =>
    api
      .post('/ai/assist', { section, context, instruction })
      .then((r) => r.data),
}
