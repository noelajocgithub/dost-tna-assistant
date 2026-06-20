import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children, roles }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Token exists but user not hydrated yet — let the bootstrap finish.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
