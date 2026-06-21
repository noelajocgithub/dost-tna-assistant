import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Cpu,
  MessageSquareText,
  Trash2,
  ScrollText,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

// Nav items per role.
const NAV = {
  enterprise: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forms', label: 'My Forms', icon: FileText },
  ],
  provincial_staff: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forms', label: 'My Forms', icon: FileText },
  ],
  provincial_director: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forms', label: 'TNA Forms', icon: FileText },
  ],
  regional_evaluator: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/evaluate', label: 'Evaluations', icon: ClipboardCheck },
  ],
  tna_lead: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/evaluate', label: 'Evaluations', icon: ClipboardCheck },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/ai', label: 'AI Configuration', icon: Cpu },
    { to: '/admin/ai-prompts', label: 'AI Prompts', icon: MessageSquareText },
    { to: '/admin/deletion-requests', label: 'Deletion Requests', icon: Trash2 },
    { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  ],
  regional_director: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/evaluate', label: 'All Forms & Evaluations', icon: ClipboardCheck },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/ai', label: 'AI Configuration', icon: Cpu },
    { to: '/admin/ai-prompts', label: 'AI Prompts', icon: MessageSquareText },
    { to: '/admin/deletion-requests', label: 'Deletion Requests', icon: Trash2 },
    { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  ],
}

export default function Sidebar({ open }) {
  const role = useAuthStore((s) => s.user?.role)
  const items = NAV[role] || []

  return (
    <aside
      className={`glass-dark text-charcoal w-56 shrink-0 ${
        open ? 'block' : 'hidden'
      } md:block`}
    >
      <nav className="py-3 px-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white border-l-4 border-cyan'
                  : 'border-l-4 border-transparent text-muted hover:bg-white/10 hover:text-charcoal'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
