import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { adminApi } from '../../api/admin'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { RoleBadge } from '../../components/ui/Badge'
import { ROLES, UNITS, PROVINCES } from '../../constants/org'

const EMPTY = {
  name: '',
  email: '',
  password: '',
  role: 'enterprise',
  province: '',
  unit: '',
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    setLoading(true)
    adminApi
      .listUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setModalOpen(true)
  }

  function openEdit(u) {
    setEditing(u)
    setForm({ ...u, password: '' })
    setError('')
    setModalOpen(true)
  }

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      // Empty unit must be sent as null (it's validated against the unit list).
      const base = { ...form, unit: form.unit || null }
      if (editing) {
        const payload = { ...base }
        if (!payload.password) delete payload.password
        await adminApi.updateUser(editing.id, payload)
      } else {
        await adminApi.createUser(base)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(
        errs ? Object.values(errs).flat()[0] : err.response?.data?.message || 'Save failed.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(u) {
    await adminApi.updateUser(u.id, { is_active: !u.is_active })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">User Management</h1>
        <Button onClick={openCreate}>
          <span className="flex items-center gap-1.5">
            <Plus size={16} strokeWidth={1.5} /> Add User
          </span>
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Province</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral hover:bg-neutral">
                  <td className="px-4 py-3 text-charcoal">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.unit || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.province || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${u.is_active ? 'text-green' : 'text-red-600'}`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-primary text-xs border border-primary px-2 py-1 hover:bg-neutral"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-xs border border-neutral px-2 py-1 hover:bg-neutral"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <Input label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label={editing ? 'Password (leave blank to keep)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
          <Select label="Role" value={form.role} onChange={(e) => set('role', e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select label="Unit" value={form.unit || ''} onChange={(e) => set('unit', e.target.value)}>
            <option value="">— None —</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Select
            label="Province"
            value={form.province || ''}
            onChange={(e) => set('province', e.target.value)}
          >
            <option value="">— None —</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  )
}
