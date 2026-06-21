import { useState } from 'react'

// Lightweight controlled fields that bind to a section-data object.
// Each takes `value` + `onChange(name, value)` so step components stay concise.

export function TextField({ label, name, value, onChange, type = 'text', ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value?.[name] ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg"
        {...rest}
      />
    </div>
  )
}

export function TextAreaField({ label, name, value, onChange, rows = 4, header, ...rest }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        {header}
      </div>
      <textarea
        rows={rows}
        value={value?.[name] ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border border-neutral bg-background text-charcoal text-sm px-3 py-2 focus:outline-none focus:border-primary rounded-none resize-y"
        {...rest}
      />
    </div>
  )
}

// Dropdown bound to a section-data object.
export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select…',
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-1">
          {label}
        </label>
      )}
      <select
        value={value?.[name] ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const text = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={val} value={val}>
              {text}
            </option>
          )
        })}
      </select>
    </div>
  )
}

// Flat bordered radio toggle group.
export function RadioGroup({ label, name, value, onChange, options }) {
  const current = value?.[name] ?? ''
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-1">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const text = typeof opt === 'string' ? opt : opt.label
          const active = current === val
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(name, val)}
              className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${
                active
                  ? 'bg-primary text-white border-primary/40 shadow shadow-primary/20'
                  : 'bg-white/5 text-charcoal border-white/15 hover:bg-white/10'
              }`}
            >
              {text}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function YesNo({ label, name, value, onChange }) {
  return (
    <RadioGroup
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={['Yes', 'No']}
    />
  )
}

// Two-column grid wrapper for compact field layouts.
export function FieldGrid({ children, cols = 2 }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'sm:grid-cols-2' : ''}`}>
      {children}
    </div>
  )
}

const INPUT_CLS =
  'glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg'

function Wrap({ label, error, children }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-1">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// Email field — flags an invalid address (still stored, but visibly marked).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function EmailField({ label, name, value, onChange, ...rest }) {
  const v = value?.[name] ?? ''
  const invalid = v !== '' && !EMAIL_RE.test(v)
  return (
    <Wrap label={label} error={invalid ? 'Enter a valid email address' : null}>
      <input
        type="email"
        value={v}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${INPUT_CLS} ${invalid ? 'border-red-500' : ''}`}
        {...rest}
      />
    </Wrap>
  )
}

// Year dropdown from `from` (default 1945) to the current year.
export function YearSelect({ label, name, value, onChange, from = 1945 }) {
  const now = new Date().getFullYear()
  const years = []
  for (let y = now; y >= from; y--) years.push(y)
  return (
    <Wrap label={label}>
      <select
        value={value?.[name] ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        className={INPUT_CLS}
      >
        <option value="">Select…</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </Wrap>
  )
}

// Integer-only field. Stores a Number (or '').
export function IntegerField({ label, name, value, onChange, ...rest }) {
  const v = value?.[name] ?? ''
  return (
    <Wrap label={label}>
      <input
        inputMode="numeric"
        value={v}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, '')
          onChange(name, digits === '' ? '' : parseInt(digits, 10))
        }}
        className={INPUT_CLS}
        {...rest}
      />
    </Wrap>
  )
}

// Decimal number field (digits + single dot). Stores a Number on blur.
export function DecimalField({ label, name, value, onChange, ...rest }) {
  const stored = value?.[name]
  const [draft, setDraft] = useState(null)
  const display = draft !== null ? draft : stored == null ? '' : String(stored)
  return (
    <Wrap label={label}>
      <input
        inputMode="decimal"
        value={display}
        onChange={(e) => {
          let v = e.target.value.replace(/[^0-9.]/g, '')
          const i = v.indexOf('.')
          if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '')
          setDraft(v)
        }}
        onBlur={() => {
          if (draft === null) return
          const n = parseFloat(draft)
          onChange(name, draft === '' || isNaN(n) ? '' : n)
          setDraft(null)
        }}
        className={INPUT_CLS}
        {...rest}
      />
    </Wrap>
  )
}

// Currency field — accepts commas, displays grouped with 2 decimals,
// stores a Number rounded to 2 decimals (or '').
export function CurrencyField({ label, name, value, onChange, ...rest }) {
  const stored = value?.[name]
  const [draft, setDraft] = useState(null)
  let formatted
  if (stored === '' || stored == null) {
    formatted = ''
  } else if (Number.isFinite(Number(stored))) {
    formatted = Number(stored).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else {
    // legacy / non-numeric value: show as-is instead of "NaN"
    formatted = String(stored)
  }
  const display = draft !== null ? draft : formatted
  return (
    <Wrap label={label}>
      <input
        inputMode="decimal"
        value={display}
        onFocus={() =>
          setDraft(stored == null || stored === '' ? '' : String(stored))
        }
        onChange={(e) => {
          let v = e.target.value.replace(/[^0-9.,]/g, '')
          setDraft(v)
        }}
        onBlur={() => {
          if (draft === null) return
          const n = parseFloat(draft.replace(/,/g, ''))
          onChange(name, draft === '' || isNaN(n) ? '' : Math.round(n * 100) / 100)
          setDraft(null)
        }}
        className={INPUT_CLS}
        {...rest}
      />
    </Wrap>
  )
}
