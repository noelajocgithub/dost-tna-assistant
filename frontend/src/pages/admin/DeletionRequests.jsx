import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { formatDateTime } from '../../utils/format'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/Badge'

export default function DeletionRequests() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null) // form pending approval
  const [busy, setBusy] = useState(false)

  function load() {
    setLoading(true)
    adminApi
      .deletionRequests()
      .then(setRows)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function approve() {
    setBusy(true)
    try {
      await adminApi.approveDeletion(confirm.id)
      setConfirm(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  async function reject(id) {
    await adminApi.rejectDeletion(id)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Deletion Requests</h1>

      <Card>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Trash2
              size={40}
              strokeWidth={1.5}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-sm text-charcoal font-medium">
              No pending deletion requests.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Enterprise</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested By</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral hover:bg-neutral">
                  <td className="px-4 py-3 text-charcoal">
                    {r.enterprise_name || (
                      <span className="text-gray-400 italic">Untitled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.requested_by}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs whitespace-pre-wrap">
                    {r.reason}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(r.requested_at)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => reject(r.id)}
                      className="text-xs border border-neutral px-3 py-1.5 rounded-lg hover:bg-neutral"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setConfirm(r)}
                      className="text-xs bg-red-600 text-white border border-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700"
                    >
                      Approve &amp; Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Approve Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={approve} disabled={busy}>
              {busy ? 'Deleting…' : 'Approve & Permanently Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal">
          This will <span className="font-semibold">permanently delete</span>{' '}
          <span className="font-semibold">
            {confirm?.enterprise_name || 'this form'}
          </span>{' '}
          and all of its sections, attachments, and evaluations. This cannot be
          undone.
        </p>
      </Modal>
    </div>
  )
}
