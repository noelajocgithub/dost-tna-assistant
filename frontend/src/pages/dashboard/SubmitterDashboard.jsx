import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Trash2, Eye, Pencil } from 'lucide-react'
import { formsApi } from '../../api/forms'
import { formatDate } from '../../utils/format'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

export default function SubmitterDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  // Supervisor view = sees forms from others (shows a "Submitted By" column).
  const isProvincialStaff =
    role === 'provincial_staff' || role === 'provincial_director'
  const canCreate = role === 'enterprise' || role === 'provincial_staff'
  const isDirector = role === 'provincial_director'
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  // Deletion-request modal
  const [delForm, setDelForm] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  function loadForms() {
    return formsApi.list().then(setForms)
  }

  useEffect(() => {
    loadForms().finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    setCreating(true)
    try {
      const form = await formsApi.create(name.trim() || null)
      navigate(`/forms/${form.id}`)
    } finally {
      setCreating(false)
    }
  }

  function openDelete(e, form) {
    e.stopPropagation()
    setDelForm(form)
    setReason('')
  }

  async function submitDeletion() {
    if (reason.trim().length < 3) return
    setBusy(true)
    try {
      await formsApi.requestDeletion(delForm.id, reason.trim())
      setDelForm(null)
      await loadForms()
    } finally {
      setBusy(false)
    }
  }

  async function cancelDeletion(e, form) {
    e.stopPropagation()
    await formsApi.cancelDeletion(form.id)
    await loadForms()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">
          {isDirector
            ? 'Provincial TNA Submissions'
            : isProvincialStaff
              ? 'TNA Submissions'
              : 'My TNA Submissions'}
        </h1>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={16} strokeWidth={1.5} /> New TNA Form
            </span>
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : forms.length === 0 ? (
          <div className="p-12 text-center">
            <FileText
              size={40}
              strokeWidth={1.5}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-sm text-charcoal font-medium">No forms yet.</p>
            {canCreate && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Start your first Technology Needs Assessment.
                </p>
                <Button onClick={() => setModalOpen(true)}>
                  Start your first TNA
                </Button>
              </>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Enterprise Name</th>
                {isProvincialStaff && (
                  <th className="px-4 py-3 font-medium">Submitted By</th>
                )}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/forms/${f.id}?mode=view`)}
                  className="border-b border-neutral hover:bg-neutral cursor-pointer"
                >
                  <td className="px-4 py-3 text-charcoal">
                    {f.enterprise_name || (
                      <span className="text-gray-400 italic">Untitled draft</span>
                    )}
                  </td>
                  {isProvincialStaff && (
                    <td className="px-4 py-3 text-gray-600">
                      {f.submitted_by}
                      {f.is_own && (
                        <span className="ml-1 text-xs text-cyan">(you)</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(f.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/forms/${f.id}?mode=view`)
                      }}
                      title="View (read-only)"
                      className="text-primary border border-primary px-2 py-1 rounded-lg hover:bg-neutral mr-2"
                    >
                      <Eye size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/forms/${f.id}?mode=edit`)
                      }}
                      title="Edit"
                      className="text-cyan border border-cyan px-2 py-1 rounded-lg hover:bg-cyan hover:text-white mr-2"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    {f.deletion_requested ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-yellow font-medium">
                          Deletion pending
                        </span>
                        <button
                          onClick={(e) => cancelDeletion(e, f)}
                          className="text-xs text-gray-500 underline hover:text-charcoal"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => openDelete(e, f)}
                        title="Request deletion"
                        className="text-red-600 border border-red-300 px-2 py-1 rounded-lg hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create form modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New TNA Form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <Input
          label="Enterprise Name"
          placeholder="e.g. Kahoy Furniture"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          You can change this later. A draft will be created and you'll continue
          to the form wizard.
        </p>
      </Modal>

      {/* Request deletion modal */}
      <Modal
        open={!!delForm}
        onClose={() => setDelForm(null)}
        title="Request Form Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDelForm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={submitDeletion}
              disabled={busy || reason.trim().length < 3}
            >
              {busy ? 'Submitting…' : 'Request Deletion'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal mb-3">
          Deleting <span className="font-semibold">{delForm?.enterprise_name || 'this form'}</span>{' '}
          requires administrator approval. The form remains until an admin
          approves the request.
        </p>
        <Textarea
          label="Reason for deletion (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Duplicate entry / created in error"
        />
      </Modal>
    </div>
  )
}
