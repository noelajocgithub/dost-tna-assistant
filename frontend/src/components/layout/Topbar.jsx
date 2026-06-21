import { useState } from 'react'
import { Menu, LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleBadge } from '../ui/Badge'
import { getTheme, toggleTheme } from '../../utils/theme'

export default function Topbar({ onToggleSidebar }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [theme, setThemeState] = useState(getTheme())

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="glass-primary text-charcoal h-14 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden hover:bg-white/10 p-1.5 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white p-1 shadow-sm">
          <img src="/dost-logo.svg" alt="DOST" className="w-full h-full" />
        </span>
        <span className="text-xl font-bold tracking-tight">DOST TNA System</span>
      </div>
      <div className="flex items-center gap-3">
        {user && <RoleBadge role={user.role} />}
        <span className="text-sm text-muted hidden sm:inline">{user?.name}</span>
        <button
          onClick={() => setThemeState(toggleTheme())}
          className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </header>
  )
}
