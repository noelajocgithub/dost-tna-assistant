import { IntegerField, FieldGrid } from '../Field'

const CATEGORIES = [
  { key: 'direct', label: 'Direct' },
  { key: 'production', label: 'Production' },
  { key: 'non_production', label: 'Non-Production' },
  { key: 'contract', label: 'Contract' },
]

export default function Workforce({ value, onChange }) {
  const p = { value, onChange }

  function cell(catKey, gender) {
    const name = `${catKey}_${gender}`
    return (
      <input
        inputMode="numeric"
        value={value?.[name] ?? ''}
        onChange={(e) => {
          const d = e.target.value.replace(/[^0-9]/g, '')
          onChange(name, d === '' ? '' : parseInt(d, 10))
        }}
        className="glass-input w-full px-2 py-1 text-sm rounded-lg"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-2">
          Employee Count
        </h3>
        <div className="border border-neutral overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-muted uppercase bg-neutral">
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Male</th>
                <th className="px-2 py-2 font-medium">Female</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c) => (
                <tr key={c.key} className="border-b border-neutral">
                  <td className="px-2 py-2 text-charcoal">{c.label}</td>
                  <td className="p-2">{cell(c.key, 'male')}</td>
                  <td className="p-2">{cell(c.key, 'female')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FieldGrid>
        <IntegerField label="Senior Citizens" name="senior_citizens" {...p} />
        <IntegerField label="PWDs" name="pwds" {...p} />
        <IntegerField label="Total Employees" name="total_employees" {...p} />
      </FieldGrid>
    </div>
  )
}
