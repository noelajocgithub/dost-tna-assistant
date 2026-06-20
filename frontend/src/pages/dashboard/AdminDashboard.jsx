import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'

// Slice 1 placeholder — Slice 6 adds metrics / shortcuts.
export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>
      <Card className="p-6">
        <p className="text-sm text-charcoal">
          Welcome, <span className="font-semibold">{user?.name}</span>.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Manage users and AI provider configuration from the sidebar.
        </p>
      </Card>
    </div>
  )
}
