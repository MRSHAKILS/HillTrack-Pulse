import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard.tsx'
import VolunteerDashboard from './pages/VolunteerDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Login Page */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Volunteer Route */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedTypes={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
