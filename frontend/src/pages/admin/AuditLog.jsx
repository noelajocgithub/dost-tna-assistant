import { useEffect, useState } from 'react'
import { ScrollText, RefreshCw } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { formatDateTime } from '../../utils/format'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'

// Friendly labels + accent colors per action family.
const ACTION_META = {
  'auth.login': { label: 'Login', cls: 'text-cyan' },
  'auth.logout': { label: 'Logout', cls: 'text-muted' },
  'form.create': { label: 'Form Created', cls: 'text-primary' },
  'form.section_save': { label: 'Section Saved', cls: 'text-charcoal' },
  'form.submit': { label: 'Form Submitted', cls: 'text-cyan' },
  'form.deletion_request': { label: 'Deletion Requested', cls: 'text-yellow' },
  'form.deletion_cancel': { label: 'Deletion Cancelled', cls: 'text-muted' },
  'form.deletion_approve': { label: 'Deletion Approved', cls: 'text-red-500' },
  'form.deletion_reject': { label: 'Deletion Rejected', cls: 'text-muted' },
  'evaluation.comment': { label: 'Section Decision', cls: 'text-charcoal' },
  'evaluation.overall': { label: 'Overall Evaluation', cls: 'text-green' },
  'ai.assist': { label: 'AI Assist', cls: 'text-cyan' },
  'admin.user_create': { label: 'User Created', cls: 'text-primary' },
  'admin.user_update': { label: 'User Updated', cls: 'text-charcoal' },
  'admin.ai_config_update': { label: 'AI Config Updated', cls: 'text-primary' },
}

export default function AuditLog() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')

  function load() {
    setLoading(true)
    adminApi
      .activityLogs(action ? { action } : {})
      .then(setRows)
      .finally(() => setLoading(false))
  }

  useEffect(load, [action])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Audit Log</h1>
        <Button variant="secondary" onClick={load}>
          <span className="flex items-center gap-1.5">
            <RefreshCw size={14} strokeWidth={1.5} /> Refresh
          </span>
        </Button>
      </div>

      <Card className="p-4">
        <div className="w-64">
          <Select
            label="Filter by activity"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">All activities</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText
              size={40}
              strokeWidth={1.5}
              className="mx-auto text-muted mb-3"
            />
            <p className="text-sm text-charcoal font-medium">
              No activity recorded yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const meta = ACTION_META[r.action] || {
                  label: r.action,
                  cls: 'text-charcoal',
                }
                return (
                  <tr key={r.id} className="border-b border-neutral hover:bg-neutral">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {r.user_name || '—'}
                    </td>
                    <td className={`px-4 py-3 font-medium ${meta.cls}`}>
                      {meta.label}
                    </td>
                    <td className="px-4 py-3 text-muted">{r.description}</td>
                    <td className="px-4 py-3 text-muted text-xs">{r.ip}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
