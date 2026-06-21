import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import EvaluatorDashboard from './pages/dashboard/EvaluatorDashboard'
import FormWizard from './pages/form/FormWizard'
import EvaluationReview from './pages/review/EvaluationReview'
import UserManagement from './pages/admin/UserManagement'
import AIConfig from './pages/admin/AIConfig'
import AIPrompts from './pages/admin/AIPrompts'
import DeletionRequests from './pages/admin/DeletionRequests'
import AuditLog from './pages/admin/AuditLog'

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const initialized = useAuthStore((s) => s.initialized)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-sm text-muted">
        Loading…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/forms"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/forms/:id"
            element={
              <ProtectedRoute
                roles={['enterprise', 'provincial_staff', 'provincial_director']}
              >
                <FormWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluate"
            element={
              <ProtectedRoute roles={['regional_evaluator', 'tna_lead', 'regional_director']}>
                <EvaluatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluate/:id"
            element={
              <ProtectedRoute roles={['regional_evaluator', 'tna_lead', 'regional_director']}>
                <EvaluationReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin', 'regional_director']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai"
            element={
              <ProtectedRoute roles={['admin', 'regional_director']}>
                <AIConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-prompts"
            element={
              <ProtectedRoute roles={['admin', 'regional_director']}>
                <AIPrompts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deletion-requests"
            element={
              <ProtectedRoute roles={['admin', 'regional_director']}>
                <DeletionRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-log"
            element={
              <ProtectedRoute roles={['admin', 'regional_director']}>
                <AuditLog />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
