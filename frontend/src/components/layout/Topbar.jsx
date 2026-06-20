import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleBadge } from '../ui/Badge'

export default function Topbar({ onToggleSidebar }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="glass-primary text-white h-14 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden hover:bg-white/20 p-1.5 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <img src="/dost-logo.svg" alt="DOST" className="w-9 h-9" />
        <span className="text-xl font-bold tracking-tight">DOST TNA System</span>
      </div>
      <div className="flex items-center gap-4">
        {user && <RoleBadge role={user.role} />}
        <span className="text-sm hidden sm:inline">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm hover:bg-white/20 px-2 py-1 rounded-lg"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </header>
  )
}
