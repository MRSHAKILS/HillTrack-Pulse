import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Lock, User, UserCog, Mail, Key, MapPin, Shield } from 'lucide-react'

const LoginPage = () => {
  const [loginType, setLoginType] = useState<'admin' | 'volunteer'>('admin')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [volunteerId, setVolunteerId] = useState('')
  const [locationCode, setLocationCode] = useState('')
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (loginType === 'admin') {
      // Admin authentication (dummy check)
      if (adminEmail === 'admin' && adminPassword === 'admin') {
        login('admin')
        navigate('/admin')
      } else {
        setError('Invalid admin credentials. Use admin/admin for demo.')
      }
    } else {
      // Volunteer authentication (any ID and location code)
      if (volunteerId && locationCode) {
        login('volunteer')
        navigate('/volunteer')
      } else {
        setError('Please enter both Volunteer ID and Location Code.')
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 to-emerald-800">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-30" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
          <div className="max-w-md text-center">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <Activity className="w-16 h-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4">HillTrack Pulse</h1>
              <div className="h-1 w-24 bg-emerald-300 mx-auto mb-6"></div>
              <p className="text-xl text-emerald-100">
                Healthcare Monitoring System
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 text-left bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-emerald-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Secure Access</h3>
                  <p className="text-emerald-100 text-sm">Role-based authentication for administrators and field volunteers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-emerald-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Real-time Tracking</h3>
                  <p className="text-emerald-100 text-sm">Geospatial monitoring of health data across Rangamati Hill District</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="w-6 h-6 text-emerald-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Live Analytics</h3>
                  <p className="text-emerald-100 text-sm">Instant insights and disease outbreak detection</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-emerald-200 text-sm">
              <p>Future Builders 2025 Hackathon</p>
              <p className="text-xs mt-1 text-emerald-300">NSU • BUET • AIUB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Activity className="w-10 h-10 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800">HillTrack Pulse</h1>
            </div>
            <p className="text-slate-600 text-sm">Healthcare Monitoring System</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  loginType === 'admin'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserCog className="w-5 h-5" />
                  <span>Admin Login</span>
                </div>
              </button>
              <button
                onClick={() => setLoginType('volunteer')}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  loginType === 'volunteer'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Volunteer Login</span>
                </div>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-slate-600 text-sm">
                  {loginType === 'admin' 
                    ? 'Sign in to access the admin dashboard' 
                    : 'Sign in to enter field data'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {loginType === 'admin' ? (
                  <>
                    {/* Admin Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="admin"
                          required
                        />
                      </div>
                    </div>

                    {/* Admin Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Demo: Use <span className="font-mono bg-slate-100 px-1 rounded">admin</span> / <span className="font-mono bg-slate-100 px-1 rounded">admin</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Volunteer ID */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Volunteer ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={volunteerId}
                          onChange={(e) => setVolunteerId(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="V12345"
                          required
                        />
                      </div>
                    </div>

                    {/* Location Code */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Location Code
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={locationCode}
                          onChange={(e) => setLocationCode(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="RNG-001"
                          required
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Enter any ID and location code for demo
                      </p>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-center text-xs text-slate-500">
                  Secured access for Rangamati Hill District Healthcare Network
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
