import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut, Save, User, MapPin, Stethoscope, Calendar, Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface PatientData {
  id: number
  name: string
  age: string
  symptoms: string
  location: string
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
    location: ''
  })

  // Offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<PatientData[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  // Volunteer info
  const [volunteerName] = useState('Field Volunteer #' + Math.floor(Math.random() * 1000))

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
      // ONLINE MODE: Send to backend
      try {
        // Mock API call (replace with actual endpoint later)
        await axios.post('http://localhost:8000/api/data', newEntry)
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
      location: ''
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl border-2 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
          toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
          'bg-blue-50 border-blue-500 text-blue-800'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HillTrack Pulse</h1>
                <p className="text-xs text-gray-500">Volunteer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Volunteer Name */}
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {volunteerName}
                </p>
                <p className="text-xs text-gray-500">Field Worker</p>
              </div>
              
              {/* Offline Mode Toggle */}
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  {isOfflineMode ? (
                    <WifiOff className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Wifi className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {isOfflineMode ? 'OFFLINE MODE' : 'ONLINE'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOfflineMode}
                    onChange={(e) => setIsOfflineMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Offline Queue Status Bar */}
          {offlineQueue.length > 0 && (
            <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CloudOff className="w-6 h-6 text-yellow-700" />
                  <div>
                    <p className="font-semibold text-yellow-800">
                      {offlineQueue.length} Record{offlineQueue.length !== 1 ? 's' : ''} Pending Sync
                    </p>
                    <p className="text-sm text-yellow-700">
                      Saved locally - Click sync when online
                    </p>
                  </div>
                </div>
                {!isOfflineMode && (
                  <div className="space-y-2">
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : `Sync ${offlineQueue.length} Record${offlineQueue.length !== 1 ? 's' : ''}`}
                    </button>
                    
                    {/* Progress Bar */}
                    {isSyncing && (
                      <div className="w-48">
                        <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-600 transition-all duration-300 ease-out"
                            style={{ width: `${syncProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-yellow-700 mt-1 text-center">{syncProgress}% Complete</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Entry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Stethoscope className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Patient Data Entry</h2>
                  <p className="text-sm text-gray-500">
                    {isOfflineMode ? '📴 Working Offline - Data will sync later' : '🌐 Connected to server'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter patient full name"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Patient age"
                  />
                </div>

                {/* Symptoms Dropdown */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Activity className="w-4 h-4" />
                    Symptoms
                  </label>
                  <select
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                {/* Location */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Rangamati Sadar, Village name"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                    isOfflineMode 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {isOfflineMode ? 'Save Offline' : 'Submit Data'}
                </button>
              </form>
            </div>
          </div>

          {/* Queue Display */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Data Queue</h3>
              
              {/* Offline Queue Section */}
              {offlineQueue.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                      <CloudOff className="w-5 h-5" />
                      Pending ({offlineQueue.length})
                    </h4>
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {offlineQueue.map((item) => (
                      <div 
                        key={item.id} 
                        className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4"
                      >
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.age} yrs • {item.symptoms}
                        </p>
                        <p className="text-sm text-gray-600">📍 {item.location}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending records</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {isOfflineMode ? 'Submit forms to queue data offline' : 'All data synced'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VolunteerDashboard
