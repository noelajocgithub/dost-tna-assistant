import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Eye, Pencil, Inbox, CheckCircle2, RotateCcw } from 'lucide-react'
import { evaluationsApi } from '../../api/evaluations'
import { dashboardApi } from '../../api/dashboard'
import { formatDate } from '../../utils/format'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'

export default function EvaluatorDashboard() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [province, setProvince] = useState('')

  useEffect(() => {
    dashboardApi.get().then(setSummary).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (status) params.status = status
    if (province) params.province = province
    evaluationsApi
      .list(params)
      .then(setForms)
      .finally(() => setLoading(false))
  }, [status, province])

  const provinces = [...new Set(forms.map((f) => f.province).filter(Boolean))]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Evaluation Queue</h1>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Awaiting Review"
            value={summary.stats.awaiting}
            icon={Inbox}
            accent="cyan"
            hint="Newly submitted"
          />
          <StatCard
            label="Under Review"
            value={summary.stats.in_review}
            icon={ClipboardCheck}
            accent="yellow"
          />
          <StatCard
            label="Validated"
            value={summary.stats.validated}
            icon={CheckCircle2}
            accent="green"
          />
          <StatCard
            label="Returned"
            value={summary.stats.returned}
            icon={RotateCcw}
            accent="red"
          />
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="validated">Validated</option>
              <option value="returned">Returned</option>
            </Select>
          </div>
          <div className="w-48">
            <Select
              label="Province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="">All</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : forms.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck
              size={40}
              strokeWidth={1.5}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-sm text-charcoal font-medium">
              No forms to review.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Enterprise Name</th>
                <th className="px-4 py-3 font-medium">Province</th>
                <th className="px-4 py-3 font-medium">Submitted By</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/evaluate/${f.id}?mode=view`)}
                  className="border-b border-neutral hover:bg-neutral cursor-pointer"
                >
                  <td className="px-4 py-3 text-charcoal">
                    {f.enterprise_name || (
                      <span className="text-gray-400 italic">Untitled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.province || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{f.submitted_by}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(f.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/evaluate/${f.id}?mode=view`)
                      }}
                      title="View (read-only)"
                      className="text-primary border border-primary px-2 py-1 rounded-lg hover:bg-neutral mr-2"
                    >
                      <Eye size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/evaluate/${f.id}?mode=edit`)
                      }}
                      title="Edit evaluation"
                      className="text-cyan border border-cyan px-2 py-1 rounded-lg hover:bg-cyan hover:text-white"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
