import { useAuthStore } from '../../store/authStore'
import SubmitterDashboard from './SubmitterDashboard'
import EvaluatorDashboard from './EvaluatorDashboard'
import AdminDashboard from './AdminDashboard'

// Role-based dashboard router.
export default function Dashboard() {
  const role = useAuthStore((s) => s.user?.role)

  if (role === 'regional_evaluator' || role === 'tna_lead')
    return <EvaluatorDashboard />
  if (role === 'admin' || role === 'regional_director') return <AdminDashboard />
  // enterprise, provincial_staff, provincial_director
  return <SubmitterDashboard />
}
