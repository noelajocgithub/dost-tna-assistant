import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const CELL_CLS =
  'glass-input w-full px-2 py-1 text-sm rounded-lg'

// A single editable cell aware of its column type:
//   text    -> string
//   integer -> Number (digits only)
//   decimal -> Number (digits + one dot), parsed on blur
//   currency-> Number rounded to 2 decimals, displayed grouped with commas
function Cell({ type = 'text', value, onChange, from = 1950 }) {
  const [draft, setDraft] = useState(null)

  if (type === 'year') {
    const now = new Date().getFullYear()
    const years = []
    for (let y = now; y >= from; y--) years.push(y)
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        className={CELL_CLS}
      >
        <option value="">Select…</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'integer') {
    return (
      <input
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => {
          const d = e.target.value.replace(/[^0-9]/g, '')
          onChange(d === '' ? '' : parseInt(d, 10))
        }}
        className={CELL_CLS}
      />
    )
  }

  if (type === 'decimal' || type === 'currency') {
    let formatted
    if (value == null || value === '') {
      formatted = ''
    } else if (type === 'currency' && Number.isFinite(Number(value))) {
      formatted = Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else {
      // legacy / non-numeric value: show as-is instead of "NaN"
      formatted = String(value)
    }
    const display = draft !== null ? draft : formatted
    return (
      <input
        inputMode="decimal"
        value={display}
        onFocus={() =>
          setDraft(value == null || value === '' ? '' : String(value))
        }
        onChange={(e) => {
          let v = e.target.value.replace(/[^0-9.,]/g, '')
          if (type === 'decimal') v = v.replace(/,/g, '')
          setDraft(v)
        }}
        onBlur={() => {
          if (draft === null) return
          const n = parseFloat(draft.replace(/,/g, ''))
          if (draft === '' || isNaN(n)) onChange('')
          else onChange(type === 'currency' ? Math.round(n * 100) / 100 : n)
          setDraft(null)
        }}
        className={CELL_CLS}
      />
    )
  }

  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={CELL_CLS}
    />
  )
}

// Add/remove row table bound to an array on the section data.
// `columns`: [{ key, label, type? }]. Rows are plain objects.
export default function DynamicTable({ label, name, value, onChange, columns }) {
  const rows = Array.isArray(value?.[name]) ? value[name] : []

  function setRows(next) {
    onChange(name, next)
  }

  function addRow() {
    const blank = Object.fromEntries(columns.map((c) => [c.key, '']))
    setRows([...rows, blank])
  }

  function updateCell(idx, key, val) {
    setRows(rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r)))
  }

  function removeRow(idx) {
    setRows(rows.filter((_, i) => i !== idx))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-2">
          {label}
        </label>
      )}
      <div className="border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted uppercase bg-white/5">
              {columns.map((c) => (
                <th key={c.key} className="px-2 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-2 py-3 text-muted text-xs italic"
                >
                  No rows yet.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="border-b border-white/30">
                  {columns.map((c) => (
                    <td key={c.key} className="p-2 align-top">
                      <Cell
                        type={c.type}
                        from={c.from}
                        value={row[c.key]}
                        onChange={(val) => updateCell(idx, c.key, val)}
                      />
                    </td>
                  ))}
                  <td className="p-2 align-top">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="text-red-500 border border-red-500/40 px-2 py-1 rounded-lg hover:bg-red-500/10"
                      aria-label="Remove row"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-sm text-cyan border border-cyan px-3 py-1 hover:bg-sky-50 mt-2 rounded-lg"
      >
        <Plus size={14} strokeWidth={1.5} /> Add Row
      </button>
    </div>
  )
}
