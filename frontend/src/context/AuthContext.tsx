import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  userType: 'admin' | 'volunteer' | null
  isAuthenticated: boolean
  login: (type: 'admin' | 'volunteer') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<'admin' | 'volunteer' | null>(null)

  const login = (type: 'admin' | 'volunteer') => {
    setUserType(type)
    localStorage.setItem('userType', type)
  }

  const logout = () => {
    setUserType(null)
    localStorage.removeItem('userType')
  }

  const isAuthenticated = userType !== null

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
