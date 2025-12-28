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
  latitude: string
  longitude: string
  date: string
  timestamp: string
}

const VolunteerDataEntry = () => {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: '',
    location: '',
    latitude: '22.6533',
    longitude: '92.1789',
    date: new Date().toISOString().split('T')[0]
  })

  // Offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<PatientData[]>([])
  const [submissions, setSubmissions] = useState<PatientData[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      showToast(`📴 Data Saved Locally (No Internet) - ${offlineQueue.length + 1} records pending`, 'warning')
    } else {
      // ONLINE MODE: Send to backend
      try {
        // Mock API call (replace with actual endpoint later)
        await axios.post('http://localhost:8000/api/data', newEntry)
        setSubmissions([newEntry, ...submissions])
        showToast('✅ Data Submitted Successfully!', 'success')
      } catch (error) {
        showToast('❌ Failed to submit. Try offline mode.', 'error')
        console.error('Submission error:', error)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HillTrack Pulse</h1>
                <p className="text-xs text-gray-500">Volunteer Data Entry</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Volunteer Name */}
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700">{volunteerName}</p>
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
                    {isOfflineMode ? 'OFFLINE' : 'ONLINE'}
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
              <div className="flex items-center justify-between">
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
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : `Sync ${offlineQueue.length} Record${offlineQueue.length !== 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>age.removeItem('offlineQueue')
      
      showToast(`✅ Successfully synced ${offlineQueue.length} records!`, 'success')
    } catch (error) {
      showToast('❌ Sync failed. Records kept in queue.', 'error')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HillTrack Pulse</h1>
                <p className="text-xs text-gray-500">Volunteer Data Entry</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {userType === 'volunteer' ? 'Field Volunteer' : 'User'}
                </p>
                <p className="text-xs text-gray-500">Data Entry Access</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Patient Data Entry Form</h2>
          </div>
          <p className="text-gray-600">
            Enter patient information collected during field visits in Rangamati Hill District
          </p>
        </div>

        {/* Data Entry Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Patient age"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="22.6533"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="92.1789"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disease Type / Visit Reason *
                  </label>
                  <select
                    name="disease_type"
                    value={formData.disease_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    <option value="Suspected Malaria">Suspected Malaria</option>
                    <option value="Confirmed Malaria">Confirmed Malaria</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Dengue Fever">Dengue Fever</option>
                    <option value="Respiratory Infection">Respiratory Infection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms / Notes
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe symptoms or additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg"
            >
              <Save className="w-5 h-5" />
              Submit Patient Data
            </button>
          </form>
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Submissions ({submissions.length})
            </h3>
            <div className="space-y-3">
              {submissions.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{entry.name}, Age {entry.age}</p>
                      <p className="text-sm text-gray-600">{entry.disease_type} - {entry.severity}</p>
                      <p className="text-xs text-gray-500">📍 {entry.latitude}, {entry.longitude}</p>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      ✓ Submitted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default VolunteerDataEntry
