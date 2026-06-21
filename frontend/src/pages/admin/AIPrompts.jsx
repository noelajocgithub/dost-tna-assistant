import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { adminApi } from '../../api/admin'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const SCOPE_TITLES = {
  system: 'System Scaffold',
  form: 'Form Fields',
  evaluation: 'Evaluator Comments',
}

const SCOPE_NOTES = {
  system:
    'Wraps every AI prompt. Keep the placeholders {section}, {context} and {instruction} — they are replaced at runtime.',
  form: 'The task instruction sent for each applicant form field.',
  evaluation:
    'Instructions for drafting evaluator comments. {section} (in the section-comment prompt) is replaced with the section title.',
}

function PromptRow({ row, onSaved }) {
  const [value, setValue] = useState(row.instruction)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const dirty = value !== row.instruction

  async function save() {
    setBusy(true)
    setMsg('')
    try {
      await adminApi.updateAiPrompt(row.key, value)
      setMsg('Saved')
      onSaved(row.key, value)
    } catch (e) {
      setMsg(e.response?.data?.message || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function reset() {
    setBusy(true)
    setMsg('')
    try {
      const r = await adminApi.resetAiPrompt(row.key)
      setValue(r.instruction)
      setMsg('Reset to default')
      onSaved(row.key, r.instruction)
    } catch (e) {
      setMsg(e.response?.data?.message || 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  const isDefault = value === row.default_instruction

  return (
    <div className="border-b border-white/30 py-4 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-charcoal">{row.label}</span>
          <code className="text-[11px] text-muted">{row.key}</code>
          {!isDefault && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30">
              Customized
            </span>
          )}
        </div>
        {msg && <span className="text-xs text-green">{msg}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={row.scope === 'system' ? 11 : 3}
        className="glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg resize-y font-mono"
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button
          variant="secondary"
          onClick={reset}
          disabled={busy || isDefault}
          title="Restore the built-in default"
        >
          <span className="flex items-center gap-1">
            <RotateCcw size={14} strokeWidth={1.5} /> Reset
          </span>
        </Button>
      </div>
    </div>
  )
}

export default function AIPrompts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .aiPrompts()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(key, instruction) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, instruction } : r)),
    )
  }

  if (loading) return <div className="text-sm text-muted">Loading…</div>

  const scopes = ['system', 'form', 'evaluation']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">AI Prompts</h1>
        <p className="text-sm text-muted mt-1">
          Edit the prompts used by AI Assist across the app. Changes apply to all
          users immediately. Users can still tweak a prompt for a single session
          from the AI Suggestion panel.
        </p>
      </div>

      {scopes.map((scope) => {
        const group = rows.filter((r) => r.scope === scope)
        if (group.length === 0) return null
        return (
          <Card key={scope} className="p-6">
            <h2 className="text-lg font-semibold text-charcoal">
              {SCOPE_TITLES[scope]}
            </h2>
            <p className="text-sm text-muted mt-1 mb-2">{SCOPE_NOTES[scope]}</p>
            {group.map((row) => (
              <PromptRow key={row.key} row={row} onSaved={handleSaved} />
            ))}
          </Card>
        )
      })}
    </div>
  )
}
