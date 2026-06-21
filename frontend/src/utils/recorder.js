// Mic capture helper. createRecorder().start() begins recording; stop() resolves
// with a File ready to upload to Audio Scribe. MediaRecorder emits
// audio/webm;codecs=opus, which Audio Scribe accepts directly.
export function createRecorder() {
  let mediaRecorder = null
  let stream = null
  let chunks = []

  function pickMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4', // Safari → save as .m4a
      'audio/ogg;codecs=opus',
    ]
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || 'audio/webm'
  }

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream, { mimeType: pickMimeType() })
    chunks = []
    mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
    mediaRecorder.start()
  }

  function stop() {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) return reject(new Error('Recorder not started'))
      const mime = mediaRecorder.mimeType
      mediaRecorder.onstop = () => {
        const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm'
        const file = new File(
          [new Blob(chunks, { type: mime })],
          `recording-${Date.now()}.${ext}`,
          { type: mime },
        )
        stream?.getTracks().forEach((t) => t.stop())
        resolve(file)
      }
      mediaRecorder.stop()
    })
  }

  return { start, stop }
}
