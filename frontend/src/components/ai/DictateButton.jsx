import { useRef, useState } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { createRecorder } from '../../utils/recorder'
import { transcribe } from '../../api/audioScribe'

// Small accent chip (sibling of AIAssistButton). Records mic audio, sends it to
// Audio Scribe, and hands the final text up via onResult(text). It owns its own
// recorder + status, so multiple instances never cross-wire.
export default function DictateButton({ onResult, disabled = false }) {
  const recorderRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  async function startRec() {
    try {
      recorderRef.current = createRecorder()
      await recorderRef.current.start()
      setRecording(true)
    } catch {
      alert('Microphone access was blocked. Allow mic access in your browser to dictate.')
    }
  }

  async function stopRec() {
    setRecording(false)
    setBusy(true)
    setProgress(0)
    try {
      const file = await recorderRef.current.stop()
      const text = await transcribe(file, setProgress)
      if (text.trim()) onResult(text.trim())
    } catch (e) {
      alert(e.message || 'Transcription failed.')
    } finally {
      setBusy(false)
    }
  }

  if (busy) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted px-2 py-1">
        <Loader2 size={13} className="animate-spin" /> Transcribing… {progress}%
      </span>
    )
  }

  return recording ? (
    <button
      type="button"
      onClick={stopRec}
      className="flex items-center gap-1 bg-red-500 text-white text-xs font-medium px-2 py-1 border border-red-500 hover:bg-red-600 rounded-none"
    >
      <Square size={13} strokeWidth={1.5} /> Stop
    </button>
  ) : (
    <button
      type="button"
      onClick={startRec}
      disabled={disabled}
      className="flex items-center gap-1 bg-cyan text-white text-xs font-medium px-2 py-1 border border-cyan hover:bg-sky-600 rounded-none disabled:opacity-50"
    >
      <Mic size={13} strokeWidth={1.5} /> Dictate
    </button>
  )
}
