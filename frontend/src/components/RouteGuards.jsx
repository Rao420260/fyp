import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Login ke bina in pages me nahi ja sakte
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary-600">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

// Sirf mukarrar roles ke liye. Baqi ko dashboard par bhej do
export function RoleGate({ roles, children }) {
  const { role } = useAuth()
  if (!roles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}