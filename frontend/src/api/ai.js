import api from './client'

export const aiApi = {
  assist: (section, context, instruction) =>
    api
      .post('/ai/assist', { section, context, instruction })
      .then((r) => r.data),
}
