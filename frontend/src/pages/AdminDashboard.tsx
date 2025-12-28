import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Activity, BarChart3, Map, Users, LogOut, TrendingUp, AlertTriangle } from 'lucide-react'
import HillMap from '../components/HillMap'
import axios from 'axios'

// Sample patient data
const samplePatients = [
  {
    id: 1,
    name: 'Patient A',
    latitude: 22.6533,
    longitude: 92.1789,
    disease_type: 'Suspected Malaria',
    severity: 'High',
    age: 34,
    date: '2025-12-27'
  },
  {
    id: 2,
    name: 'Patient B',
    latitude: 22.6600,
    longitude: 92.1850,
    disease_type: 'Suspected Malaria',
    severity: 'Critical',
    age: 28,
    date: '2025-12-27'
  },
  {
    id: 3,
    name: 'Patient C',
    latitude: 22.6450,
    longitude: 92.1720,
    disease_type: 'Routine Checkup',
    age: 45,
    date: '2025-12-28'
  },
  {
    id: 4,
    name: 'Patient D',
    latitude: 22.6700,
    longitude: 92.1900,
    disease_type: 'Routine Checkup',
    age: 22,
    date: '2025-12-28'
  },
  {
    id: 5,
    name: 'Patient E',
    latitude: 22.6580,
    longitude: 92.1950,
    disease_type: 'Suspected Malaria',
    severity: 'Moderate',
    age: 31,
    date: '2025-12-26'
  }
]

const AdminDashboard = () => {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState(samplePatients)
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Fetch status from backend
    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/')
        setBackendStatus(response.data.status)
        setIsConnected(true)
      } catch (error) {
        setBackendStatus('Backend Offline')
        setIsConnected(false)
      }
    }
    fetchStatus()

    // Fetch patient data from backend periodically
    const fetchPatientData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/data')
        if (response.data.patients && response.data.patients.length > 0) {
          // Transform backend format to frontend format
          // Reset cluster data if AI hasn't been run yet
          const transformedPatients = response.data.patients.map((p: any) => ({
            id: p.id,
            name: p.name,
            latitude: p.lat,
            longitude: p.lng,
            disease_type: p.disease_type,
            severity: p.severity || 'Moderate',
            age: p.age,
            date: p.date,
            // Only show cluster status if AI has been run (aiResult exists)
            status: aiResult ? (p.status || 'Normal') : 'Normal',
            cluster_id: aiResult ? p.cluster_id : undefined
          }))
          setPatients(transformedPatients)
        }
      } catch (error) {
        console.error('Failed to fetch patient data:', error)
      }
    }
    
    // Initial fetch
    fetchPatientData()
    
    // Poll every 5 seconds for new patient data
    const interval = setInterval(fetchPatientData, 5000)
    
    return () => clearInterval(interval)
  }, [aiResult])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const malariaCount = patients.filter(p => p.disease_type.includes('Malaria')).length
  const totalPatients = patients.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HillTrack Pulse</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {userType === 'admin' ? 'Administrator' : 'User'}
                </p>
                <p className="text-xs text-gray-500">Access Level: Full</p>
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
      <main className="container mx-auto px-4 py-8">
        {/* Backend Status Banner */}
        <div className={`rounded-lg shadow-lg p-4 mb-6 ${
          isConnected 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">{backendStatus}</h2>
              <p className="text-sm opacity-90">
                {isConnected ? '✓ API Connected' : '✗ API Offline'}
              </p>
            </div>
            <Activity className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{totalPatients}</p>
              </div>
              <Users className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Malaria Cases</p>
                <p className="text-3xl font-bold text-red-600">{malariaCount}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Routine Checks</p>
                <p className="text-3xl font-bold text-green-600">{totalPatients - malariaCount}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Regions</p>
                <p className="text-3xl font-bold text-gray-800">1</p>
              </div>
              <Map className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-800">Patient Location Map</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Real-time geospatial visualization of patient data in Rangamati Hill District
          </p>
          <div style={{ height: '500px' }}>
            <HillMap patients={patients} />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Disease Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Malaria Cases</span>
                  <span className="font-bold text-red-600">{((malariaCount / totalPatients) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(malariaCount / totalPatients) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Backend API</span>
                  <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Sync</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
