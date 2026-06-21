import { X } from 'lucide-react'
import Button from '../ui/Button'

// Flat right-side slide-in suggestion panel (no shadow — border-l only).
export default function AIAssistPanel({
  open,
  field,
  loading,
  result,
  error,
  instruction,
  onInstructionChange,
  onClose,
  onUse,
  onRegenerate,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="w-80 max-w-full glass-strong h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-charcoal">AI Suggestion</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg" aria-label="Close">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-4 py-2 text-xs text-muted border-b border-white/10">
          Field: <span className="text-charcoal">{field}</span>
        </div>

        {/* Editable prompt (this session only) */}
        {onInstructionChange && (
          <div className="px-4 py-3 border-b border-white/10 space-y-1">
            <label className="block text-xs font-medium text-muted">
              Prompt (editable for this session)
            </label>
            <textarea
              value={instruction ?? ''}
              onChange={(e) => onInstructionChange(e.target.value)}
              rows={3}
              className="glass-input w-full text-charcoal text-xs px-3 py-2 rounded-lg resize-y"
              placeholder="Instruction sent to the AI…"
            />
            <p className="text-[11px] text-muted">
              Edits apply only here. Use Regenerate to run with the new prompt.
            </p>
          </div>
        )}

        {/* Loading bar */}
        {loading && (
          <div className="w-full bg-neutral h-0.5 overflow-hidden">
            <div className="bg-cyan h-0.5 w-1/3 animate-pulse" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="border border-red-500/40 bg-red-500/10 text-red-500 text-sm px-3 py-2">
              {error}
            </div>
          ) : loading ? (
            <p className="text-sm text-muted">Generating suggestion…</p>
          ) : (
            <textarea
              readOnly
              value={result}
              rows={16}
              className="glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg resize-none"
            />
          )}
        </div>

        <div className="border-t border-white/10 p-4 space-y-2">
          <Button
            className="w-full"
            onClick={onUse}
            disabled={loading || !!error || !result}
          >
            Use this
          </Button>
          <div className="flex gap-2">
            <Button
              variant="accent"
              className="flex-1"
              onClick={onRegenerate}
              disabled={loading}
            >
              Regenerate
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Dismiss
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
