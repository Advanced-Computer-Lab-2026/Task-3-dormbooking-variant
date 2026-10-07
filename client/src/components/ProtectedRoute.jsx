import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  // wait for the session to be restored from the token before deciding
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}
