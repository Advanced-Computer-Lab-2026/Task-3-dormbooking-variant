import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  // wait for /auth/me to restore the session, or a page refresh would bounce to /login
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}
