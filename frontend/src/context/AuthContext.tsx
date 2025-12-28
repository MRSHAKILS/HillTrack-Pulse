import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  userType: 'admin' | 'volunteer' | null
  isAuthenticated: boolean
  login: (type: 'admin' | 'volunteer') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<'admin' | 'volunteer' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserType = localStorage.getItem('userType')
    if (savedUserType === 'admin' || savedUserType === 'volunteer') {
      setUserType(savedUserType)
    }
    setIsLoading(false)
  }, [])

  const login = (type: 'admin' | 'volunteer') => {
    setUserType(type)
    localStorage.setItem('userType', type)
  }

  const logout = () => {
    setUserType(null)
    localStorage.removeItem('userType')
  }

  const isAuthenticated = userType !== null

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={{ userType, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
