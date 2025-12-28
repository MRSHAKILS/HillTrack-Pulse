import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedTypes?: ('admin' | 'volunteer')[]
}

const ProtectedRoute = ({ children, allowedTypes }: ProtectedRouteProps) => {
  const { isAuthenticated, userType } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (allowedTypes && userType && !allowedTypes.includes(userType)) {
    // Redirect to appropriate dashboard if accessing wrong route
    return <Navigate to={userType === 'admin' ? '/admin' : '/volunteer'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
