import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, LogOut, Save, User, MapPin, Stethoscope, Calendar, 
  Wifi, WifiOff, Cloud, CloudOff, RefreshCw, 
  Clock, CheckCircle2, AlertTriangle, Database,
  BadgeCheck, Shield, FileText, Hash, Trophy, Medal, Crown
} from 'lucide-react'
import axios from 'axios'

// Realistic Hill Tracts Locations mapping to Coordinates
const LOCATIONS = [
  { name: "Jurachhari Valley (Deep Hills)", lat: 22.6700, lng: 92.4000 },
  { name: "Baghaichhari Center", lat: 23.1500, lng: 92.2000 },
  { name: "Kaptai Lake North", lat: 22.5000, lng: 92.2200 },
  { name: "Belaichhari Remote", lat: 22.4500, lng: 92.3500 },
  { name: "Rangamati Sadar", lat: 22.6533, lng: 92.1789 }
]

// Dummy volunteer leaderboard data
const VOLUNTEER_LEADERBOARD = [
  { id: 'V10023', name: 'Rahim Ahmed', submissions: 156, region: 'Rangamati' },
  { id: 'V10045', name: 'Fatima Begum', submissions: 142, region: 'Khagrachhari' },
  { id: 'V10012', name: 'Kamal Hossain', submissions: 128, region: 'Bandarban' },
  { id: 'V10078', name: 'Shirin Akter', submissions: 115, region: 'Rangamati' },
  { id: 'V10034', name: 'Abdul Karim', submissions: 98, region: 'Khagrachhari' },
  { id: 'V12345', name: 'Current User', submissions: 87, region: 'Chittagong Hill Tracts' }, // Current user
  { id: 'V10089', name: 'Nusrat Jahan', submissions: 76, region: 'Bandarban' },
  { id: 'V10056', name: 'Mohammad Ali', submissions: 65, region: 'Rangamati' },
  { id: 'V10067', name: 'Taslima Khatun', submissions: 54, region: 'Khagrachhari' },
  { id: 'V10091', name: 'Rafiq Islam', submissions: 43, region: 'Bandarban' },
  { id: 'V10102', name: 'Hasina Parveen', submissions: 32, region: 'Rangamati' },
  { id: 'V10113', name: 'Jamal Uddin', submissions: 21, region: 'Khagrachhari' },
]

interface PatientData {
  id: number
  name: string
  age: string
  symptoms: string
  location: string
  lat?: number
  lng?: number
  timestamp: string
}

const VolunteerDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: '',
    location: '',
    lat: 0,
    lng: 0
  })

  // Offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<PatientData[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  // Volunteer info
  const [volunteerName] = useState('Field Volunteer #V12345')
  
  // Active view state
  const [activeView, setActiveView] = useState<'dataEntry' | 'credentials' | 'leaderboard'>('dataEntry')

  // Load offline queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offlineQueue')
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue))
    }
  }, [])

  // Save offline queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
  }, [offlineQueue])

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEntry: PatientData = {
      ...formData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Save to local queue
      setOfflineQueue([...offlineQueue, newEntry])
      showToast(`📴 Data Saved Locally (No Internet) - ${offlineQueue.length + 1} record${offlineQueue.length + 1 !== 1 ? 's' : ''} pending`, 'warning')
    } else {
      // ONLINE MODE: Send to backend using /api/sync endpoint
      try {
        // Transform to backend format and sync immediately
        const recordToSync = {
          patientName: newEntry.name,
          age: newEntry.age,
          symptoms: newEntry.symptoms,
          location: newEntry.location,
          lat: newEntry.lat,
          lng: newEntry.lng,
          diseaseType: newEntry.symptoms,
          volunteerId: volunteerName,
          timestamp: newEntry.timestamp,
          severity: "Moderate"
        }
        await axios.post('http://localhost:8000/api/sync', [recordToSync])
        showToast('✅ Data Submitted Successfully!', 'success')
      } catch (error) {
        showToast('❌ Failed to submit. Try offline mode.', 'error')
        console.error('Submission error:', error)
      }
    }
    
    // Reset form
    setFormData({
      name: '',
      age: '',
      symptoms: '',
      location: '',
      lat: 0,
      lng: 0
    })
  }

  const handleSync = async () => {
    if (offlineQueue.length === 0) {
      showToast('ℹ️ No records to sync', 'info')
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Transform queue data to match backend format
      const recordsToSync = offlineQueue.map(record => ({
        patientName: record.name,
        age: record.age,
        symptoms: record.symptoms,
        location: record.location,
        lat: record.lat,
        lng: record.lng,
        diseaseType: record.symptoms,
        volunteerId: volunteerName,
        timestamp: record.timestamp,
        severity: "Moderate"
      }))

      // Call backend sync endpoint
      const response = await axios.post('http://localhost:8000/api/sync', recordsToSync)
      
      clearInterval(progressInterval)
      setSyncProgress(100)
      
      setTimeout(() => {
        showToast(`✅ ${response.data.message}`, 'success')
        
        // Clear the queue
        setOfflineQueue([])
        localStorage.removeItem('offlineQueue')
        setSyncProgress(0)
      }, 500)
      
    } catch (error) {
      showToast('❌ Sync failed. Records kept in queue.', 'error')
      console.error('Sync error:', error)
      setSyncProgress(0)
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
      }, 600)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Sidebar - Fixed Position (Left Side) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl overflow-y-auto z-20">
        <div className="p-6">
          {/* Logo Section - Matching Admin */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">HillTrack</h1>
              <p className="text-sm text-gray-500 font-medium">Volunteer Portal</p>
            </div>
          </div>

          {/* Volunteer Badge */}
          <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{volunteerName}</p>
                <p className="text-xs text-gray-500">Field Worker</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <button
              onClick={() => setActiveView('dataEntry')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                activeView === 'dataEntry'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Data Entry</span>
            </button>
            <button
              onClick={() => setActiveView('credentials')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                activeView === 'credentials'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BadgeCheck className="w-5 h-5" />
              <span>Credentials</span>
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                activeView === 'leaderboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* Connection Status */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-3 px-2">CONNECTION MODE</p>
            <div className={`p-4 rounded-xl border transition-all ${
              isOfflineMode 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOfflineMode ? (
                    <WifiOff className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Wifi className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className={`font-semibold text-sm ${isOfflineMode ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isOfflineMode ? 'Offline' : 'Online'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOfflineMode}
                    onChange={(e) => setIsOfflineMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isOfflineMode ? 'Data saved locally' : 'Direct server sync'}
              </p>
            </div>
          </div>

          {/* Offline Queue Status */}
          {offlineQueue.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800 text-sm">
                  {offlineQueue.length} Pending
                </span>
              </div>
              {!isOfflineMode && (
                <>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition font-semibold text-sm disabled:opacity-50 shadow-md"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  {isSyncing && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${syncProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-600 mt-1 text-center">{syncProgress}%</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-300 text-red-800' :
            'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Cloud className="w-5 h-5" />}
              <p className="font-semibold">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isOfflineMode 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
              }`}>
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Patient Data Entry</h2>
                <p className={`text-sm flex items-center gap-2 mt-1 ${isOfflineMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isOfflineMode ? (
                    <>
                      <CloudOff className="w-4 h-4" />
                      Working Offline • Data will sync later
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Connected to HillTrack Server
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl transition font-semibold border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {activeView === 'credentials' ? (
          /* Credentials View */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-bold text-gray-800 text-lg">Volunteer Credentials</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Official proof of authorization for field work</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Credential Badge */}
                  <div className="flex-shrink-0 flex justify-center">
                    <div className="w-40 h-52 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-200">
                      <Shield className="w-12 h-12 mb-2" />
                      <p className="text-xs font-medium opacity-80">VERIFIED</p>
                      <p className="text-2xl font-bold">V12345</p>
                      <div className="mt-3 px-3 py-1.5 bg-white/20 rounded-full">
                        <p className="text-xs font-semibold">HILLTRACK</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Credential Details */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-emerald-500" />
                          <p className="text-xs text-gray-500 font-semibold">VOLUNTEER ID</p>
                        </div>
                        <p className="font-bold text-gray-800 text-lg">V12345</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-teal-500" />
                          <p className="text-xs text-gray-500 font-semibold">ROLE</p>
                        </div>
                        <p className="font-bold text-gray-800 text-lg">Field Health Worker</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <p className="text-xs text-gray-500 font-semibold">ASSIGNED REGION</p>
                        </div>
                        <p className="font-bold text-gray-800 text-lg">Chittagong Hill Tracts</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <p className="text-xs text-gray-500 font-semibold">VALID UNTIL</p>
                        </div>
                        <p className="font-bold text-gray-800 text-lg">December 2026</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-semibold text-emerald-800">Active & Verified</p>
                          <p className="text-xs text-emerald-600">Authorized by HillTrack Health Authority</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                </div>
                
                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-500">
                    This credential serves as official proof of authorization for field health data collection under the HillTrack Pulse program. Present this when required for verification purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'leaderboard' ? (
          /* Leaderboard View */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-600" />
                  <h3 className="font-bold text-gray-800 text-lg">Volunteer Leaderboard</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Top performers ranked by patient data submissions</p>
              </div>
              
              <div className="p-6">
                {/* Top 3 Podium */}
                <div className="flex justify-center items-end gap-4 mb-8">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg mb-2">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <div className="bg-gray-100 rounded-t-xl p-3 text-center" style={{ height: '80px', width: '100px' }}>
                      <p className="font-bold text-gray-800 text-sm truncate">{VOLUNTEER_LEADERBOARD[1].name}</p>
                      <p className="text-xs text-gray-500">{VOLUNTEER_LEADERBOARD[1].submissions} submissions</p>
                    </div>
                  </div>
                  
                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <Crown className="w-8 h-8 text-amber-500 mb-1" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl mb-2">
                      <span className="text-white font-bold text-2xl">1</span>
                    </div>
                    <div className="bg-amber-100 rounded-t-xl p-3 text-center" style={{ height: '100px', width: '110px' }}>
                      <p className="font-bold text-gray-800 text-sm truncate">{VOLUNTEER_LEADERBOARD[0].name}</p>
                      <p className="text-xs text-gray-500">{VOLUNTEER_LEADERBOARD[0].submissions} submissions</p>
                      <Medal className="w-5 h-5 text-amber-600 mx-auto mt-1" />
                    </div>
                  </div>
                  
                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg mb-2">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div className="bg-orange-50 rounded-t-xl p-3 text-center" style={{ height: '60px', width: '90px' }}>
                      <p className="font-bold text-gray-800 text-sm truncate">{VOLUNTEER_LEADERBOARD[2].name}</p>
                      <p className="text-xs text-gray-500">{VOLUNTEER_LEADERBOARD[2].submissions} submissions</p>
                    </div>
                  </div>
                </div>
                
                {/* Full Leaderboard List */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-semibold mb-3 px-2">ALL VOLUNTEERS</p>
                  {VOLUNTEER_LEADERBOARD.map((volunteer, index) => {
                    const isCurrentUser = volunteer.id === 'V12345'
                    const rank = index + 1
                    return (
                      <div 
                        key={volunteer.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isCurrentUser 
                            ? 'bg-emerald-50 border-emerald-300 shadow-md' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          rank === 1 ? 'bg-amber-500 text-white' :
                          rank === 2 ? 'bg-gray-400 text-white' :
                          rank === 3 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {rank}
                        </div>
                        
                        {/* Avatar & Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isCurrentUser ? 'text-emerald-800' : 'text-gray-800'}`}>
                              {volunteer.name}
                              {isCurrentUser && <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">YOU</span>}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">ID: {volunteer.id} • {volunteer.region}</p>
                        </div>
                        
                        {/* Submissions Count */}
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isCurrentUser ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {volunteer.submissions}
                          </p>
                          <p className="text-xs text-gray-500">submissions</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Your Rank Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Your Rank: #6</p>
                        <p className="text-sm text-emerald-100">Keep submitting to climb the leaderboard!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">87</p>
                      <p className="text-xs text-emerald-100">Total Submissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Data Entry View */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Data Entry Form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className={`p-6 border-b ${
                isOfflineMode 
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100' 
                  : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
              }`}>
                <h3 className="font-bold text-gray-800 text-lg">New Patient Record</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in patient information below</p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4 text-emerald-500" />
                      Patient Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Enter patient full name"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4 text-teal-500" />
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="0"
                      max="120"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Patient age"
                    />
                  </div>
                </div>

                {/* Symptoms Dropdown */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Primary Symptoms
                  </label>
                  <select
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Select Primary Symptom --</option>
                    <option value="Fever">🌡️ Fever</option>
                    <option value="Rash">🔴 Rash</option>
                    <option value="Cough">😷 Cough</option>
                    <option value="Headache">🤕 Headache</option>
                    <option value="Fatigue">😴 Fatigue</option>
                    <option value="Nausea">🤢 Nausea</option>
                  </select>
                </div>

                {/* Location Dropdown */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Location / Village
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={(e) => {
                      const loc = LOCATIONS.find(l => l.name === e.target.value)
                      if (loc) {
                        setFormData({ 
                          ...formData, 
                          location: loc.name, 
                          lat: loc.lat, 
                          lng: loc.lng 
                        })
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all cursor-pointer"
                  >
                    <option value="">Select Village...</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  
                  {/* GPS Coordinates Badge */}
                  {formData.lat !== 0 && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-semibold">GPS COORDINATES ACQUIRED</p>
                        <p className="text-sm text-emerald-700 font-mono">{formData.lat.toFixed(4)}°N, {formData.lng.toFixed(4)}°E</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${
                    isOfflineMode 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {isOfflineMode ? 'Save to Local Queue' : 'Submit Patient Data'}
                </button>
              </form>
            </div>
          </div>

          {/* Queue Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              {/* Queue Header */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-200">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Data Queue</h3>
                      <p className="text-xs text-gray-500">Local storage</p>
                    </div>
                  </div>
                  {offlineQueue.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
                      <span className="text-amber-700 font-bold text-sm">{offlineQueue.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Content */}
              <div className="p-4">
                {offlineQueue.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {offlineQueue.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                              {index + 1}
                            </div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold">
                            PENDING
                          </div>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.age} years old</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Activity className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.symptoms}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate text-xs">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 pt-2 border-t border-gray-200 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Cloud className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No pending records</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-[180px] mx-auto">
                      {isOfflineMode ? 'Submit forms to queue data offline' : 'All records synced to server'}
                    </p>
                    {!isOfflineMode && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">All Synced</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}

export default VolunteerDashboard
