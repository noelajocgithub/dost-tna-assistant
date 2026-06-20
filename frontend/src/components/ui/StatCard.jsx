import Card from './Card'

// Accent color classes for the value + icon chip.
const ACCENTS = {
  primary: { text: 'text-primary', chip: 'bg-primary/10 text-primary' },
  cyan: { text: 'text-cyan', chip: 'bg-cyan/10 text-cyan' },
  green: { text: 'text-green', chip: 'bg-green/10 text-green' },
  yellow: { text: 'text-yellow-600', chip: 'bg-yellow/20 text-yellow-700' },
  red: { text: 'text-red-600', chip: 'bg-red-100 text-red-600' },
  charcoal: { text: 'text-charcoal', chip: 'bg-charcoal/10 text-charcoal' },
}

// Glass KPI card: a label, a big value, optional icon and hint.
// `onClick` makes the whole card a button (used for quick links).
export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'charcoal',
  hint,
  onClick,
}) {
  const a = ACCENTS[accent] || ACCENTS.charcoal
  const clickable = typeof onClick === 'function'

  return (
    <Card
      onClick={onClick}
      className={`p-4 ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${a.text}`}>{value}</p>
          {hint && <p className="text-xs text-gray-500 mt-1 truncate">{hint}</p>}
        </div>
        {Icon && (
          <span className={`shrink-0 p-2 rounded-xl ${a.chip}`}>
            <Icon size={18} strokeWidth={1.5} />
          </span>
        )}
      </div>
    </Card>
  )
}

// Compact row of status counts reusing the status palette.
const STATUS_META = {
  draft: { label: 'Draft', dot: 'bg-neutral' },
  submitted: { label: 'Submitted', dot: 'bg-cyan' },
  under_review: { label: 'Under Review', dot: 'bg-yellow' },
  validated: { label: 'Validated', dot: 'bg-green' },
  returned: { label: 'Returned', dot: 'bg-red-400' },
}

export function StatusBreakdown({ byStatus }) {
  const entries = Object.entries(byStatus || {})
  if (entries.length === 0) return null
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {entries.map(([status, count]) => {
        const m = STATUS_META[status] || { label: status, dot: 'bg-neutral' }
        return (
          <div key={status} className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${m.dot}`} />
            <span className="text-sm text-charcoal">{m.label}</span>
            <span className="text-sm font-semibold text-charcoal">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
