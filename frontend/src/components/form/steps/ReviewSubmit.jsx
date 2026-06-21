import { useState } from 'react'
import { Check, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { STEPS } from './index'
import { Input } from '../../ui/Input'
import Button from '../../ui/Button'
import { humanizeKey } from '../../../utils/labels'

// Returns true if a section has at least one non-empty value.
function isComplete(data) {
  if (!data) return false
  return Object.values(data).some((v) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== '' && v !== null && v !== undefined
  })
}

function SummaryRow({ label, value }) {
  if (value === '' || value == null) return null
  return (
    <div className="grid grid-cols-3 gap-2 py-1 border-b border-neutral text-sm">
      <span className="text-muted">{label}</span>
      <span className="col-span-2 text-charcoal whitespace-pre-wrap break-words">
        {Array.isArray(value) ? `${value.length} row(s)` : String(value)}
      </span>
    </div>
  )
}

export default function ReviewSubmit({
  sectionsData,
  enterpriseName,
  signature,
  onSignatureChange,
  onSubmit,
  submitting,
  canSubmit,
}) {
  const [open, setOpen] = useState({})

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Review each section below. Green check = has content, yellow = empty.
      </p>

      {STEPS.map((step) => {
        const data = sectionsData[step.key] || {}
        const complete = isComplete(data)
        const isOpen = open[step.key]
        return (
          <div key={step.key} className="border border-neutral">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [step.key]: !o[step.key] }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-charcoal">
                {isOpen ? (
                  <ChevronDown size={16} strokeWidth={1.5} />
                ) : (
                  <ChevronRight size={16} strokeWidth={1.5} />
                )}
                {step.title}
              </span>
              {complete ? (
                <span className="flex items-center gap-1 text-xs text-green">
                  <Check size={14} strokeWidth={1.5} /> Complete
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow">
                  <AlertTriangle size={14} strokeWidth={1.5} /> Incomplete
                </span>
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-3 border-t border-neutral">
                {Object.keys(data).length === 0 ? (
                  <p className="text-sm text-muted italic py-2">
                    No data entered.
                  </p>
                ) : (
                  Object.entries(data).map(([k, v]) => (
                    <SummaryRow key={k} label={humanizeKey(k)} value={v} />
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="border border-neutral p-4 space-y-3">
        <Input
          label="Acknowledgment — type your full name as signature"
          placeholder="e.g. Juan Dela Cruz"
          value={signature}
          onChange={(e) => onSignatureChange(e.target.value)}
        />
        {!enterpriseName && (
          <p className="text-xs text-red-500">
            Enterprise name is required before submitting (set it in Step 1).
          </p>
        )}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className={!canSubmit ? 'opacity-50' : ''}
        >
          {submitting ? 'Submitting…' : 'Submit Form'}
        </Button>
      </div>
    </div>
  )
}
