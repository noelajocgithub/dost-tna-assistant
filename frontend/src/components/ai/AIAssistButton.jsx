import { Sparkles } from 'lucide-react'

// Small accent trigger placed above a narrative textarea.
export default function AIAssistButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 bg-cyan text-white text-xs font-medium px-2 py-1 border border-cyan hover:bg-sky-600 rounded-none"
    >
      <Sparkles size={13} strokeWidth={1.5} /> AI Assist
    </button>
  )
}
