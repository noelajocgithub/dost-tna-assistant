import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Users,
  Trash2,
  Cpu,
  CheckCircle2,
  Activity,
  UserCog,
  Settings,
  ScrollText,
} from 'lucide-react'
import { dashboardApi } from '../../api/dashboard'
import { formatDateTime } from '../../utils/format'
import Card from '../../components/ui/Card'
import StatCard, { StatusBreakdown } from '../../components/ui/StatCard'
import { StatusBadge, RoleBadge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

const QUICK_LINKS = [
  { label: 'User Management', to: '/admin/users', icon: UserCog },
  { label: 'AI Configuration', to: '/admin/ai', icon: Settings },
  { label: 'Deletion Requests', to: '/admin/deletion-requests', icon: Trash2 },
  { label: 'Audit Log', to: '/admin/audit-log', icon: ScrollText },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .get()
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [])

  const stats = summary?.stats
  const extra = summary?.extra

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Welcome, <span className="font-semibold">{user?.name}</span> — a
          system-wide overview.
        </p>
      </div>

      {loading ? (
        <Card className="p-6 text-sm text-muted">Loading…</Card>
      ) : !summary ? (
        <Card className="p-6 text-sm text-muted">
          Could not load dashboard data.
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Forms"
              value={stats.forms_total}
              icon={FileText}
              accent="primary"
            />
            <StatCard
              label="Validated"
              value={stats.forms_by_status?.validated ?? 0}
              icon={CheckCircle2}
              accent="green"
            />
            <StatCard
              label="Total Users"
              value={stats.users_total}
              icon={Users}
              accent="cyan"
              hint={`${stats.users_inactive} inactive`}
            />
            <StatCard
              label="Pending Deletions"
              value={stats.pending_deletions}
              icon={Trash2}
              accent={stats.pending_deletions > 0 ? 'red' : 'charcoal'}
              hint="Click to review"
              onClick={() => navigate('/admin/deletion-requests')}
            />
          </div>

          {/* Forms by status + AI status */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                Forms by Status
              </p>
              <StatusBreakdown byStatus={stats.forms_by_status} />
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <Cpu size={14} strokeWidth={1.5} /> AI Provider
              </p>
              {extra?.ai ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-charcoal capitalize">
                    {extra.ai.provider}
                  </p>
                  <p className="text-sm text-muted">
                    {extra.ai.model || 'No model set'}
                  </p>
                  <p className="text-xs text-muted">
                    {extra.ai.provider === 'ollama'
                      ? 'Local model'
                      : extra.ai.has_api_key
                        ? 'API key configured'
                        : 'No API key set'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted">No active AI provider.</p>
              )}
            </Card>
          </div>

          {/* Users by role */}
          <Card className="p-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
              Users by Role
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.users_by_role || {}).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full pl-1 pr-3 py-1"
                >
                  <RoleBadge role={role} />
                  <span className="text-sm font-semibold text-charcoal">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent activity + recent submissions */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <Activity size={14} strokeWidth={1.5} /> Recent Activity
              </p>
              {extra?.recent_activity?.length ? (
                <div className="space-y-3">
                  {extra.recent_activity.map((log) => (
                    <div key={log.id} className="text-sm">
                      <p className="text-charcoal">{log.description}</p>
                      <p className="text-xs text-muted">
                        {log.user_name || 'System'} ·{' '}
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No activity yet.</p>
              )}
              <button
                onClick={() => navigate('/admin/audit-log')}
                className="text-sm text-cyan hover:underline mt-3"
              >
                View full audit log →
              </button>
            </Card>

            <Card className="p-4">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                Recent Submissions
              </p>
              {summary.recent?.length ? (
                <div className="space-y-2">
                  {summary.recent.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-charcoal truncate">
                        {f.enterprise_name || (
                          <span className="text-muted italic">
                            Untitled draft
                          </span>
                        )}
                      </span>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No forms yet.</p>
              )}
            </Card>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((l) => (
              <StatCard
                key={l.to}
                label="Manage"
                value={l.label}
                icon={l.icon}
                accent="primary"
                onClick={() => navigate(l.to)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
