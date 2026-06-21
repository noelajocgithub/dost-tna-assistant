// Audio Scribe transcription client. Deliberately uses plain fetch (NOT the shared
// axios `api` in client.js) so it stays independent of our auth token + 401 redirect.
const API =
  import.meta.env.VITE_AUDIO_SCRIBE_API || 'https://dostscribe.dostcaraga.ph/api'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Connectivity probe — used to hide the mic when the service is unreachable.
export async function isAvailable() {
  try {
    const res = await fetch(`${API}/health`)
    return res.ok
  } catch {
    return false
  }
}

async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file) // field name MUST be "file"
  const res = await fetch(`${API}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  return (await res.json()).audio_id
}

/**
 * Full pipeline: upload → start job → poll → resolved transcription text.
 * @param {File} file recorded audio
 * @param {(pct:number)=>void} [onProgress] progress callback (0–100)
 */
export async function transcribe(
  file,
  onProgress,
  pollMs = 2500,
  timeoutMs = 10 * 60 * 1000,
) {
  const audioId = await uploadFile(file)

  const start = await fetch(`${API}/transcribe/${audioId}`, { method: 'POST' })
  if (!start.ok) throw new Error(`Transcribe start failed (${start.status})`)

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await fetch(`${API}/status/${audioId}`)
    if (!res.ok) throw new Error(`Status check failed (${res.status})`)
    const s = await res.json()
    onProgress?.(s.progress ?? 0)
    if (s.status === 'Completed') return s.transcription_text ?? ''
    if (s.status === 'Failed') throw new Error(s.error_message || 'Transcription failed')
    if (s.status === 'Cancelled') throw new Error('Transcription cancelled')
    await sleep(pollMs)
  }
  throw new Error('Transcription timed out')
}
