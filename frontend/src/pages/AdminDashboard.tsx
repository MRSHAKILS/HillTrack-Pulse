import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, 
  BarChart3, 
  Map, 
  Users, 
  LogOut, 
  AlertTriangle, 
  Brain,
  Package,
  MapPin,
  RefreshCw
} from 'lucide-react'
import HillMap from '../components/HillMap'
import LogisticsGraph from '../components/LogisticsGraph'
import LiveFeed from '../components/LiveFeed'
import axios from 'axios'

// Initial sample patient data
const initialPatients = [
  {
    id: 1,
    name: 'Patient A',
    latitude: 22.6533,
    longitude: 92.1789,
    disease_type: 'Suspected Malaria',
    severity: 'High',
    age: 34,
    date: '2025-12-27',
    status: 'Normal'
  },
  {
    id: 2,
    name: 'Patient B',
    latitude: 22.6600,
    longitude: 92.1850,
    disease_type: 'Suspected Malaria',
    severity: 'High',
    age: 28,
    date: '2025-12-27',
    status: 'Normal'
  },
  {
    id: 3,
    name: 'Patient C',
    latitude: 22.6450,
    longitude: 92.1720,
    disease_type: 'Routine Checkup',
    age: 45,
    date: '2025-12-28',
    status: 'Normal'
  },
  {
    id: 4,
    name: 'Patient D',
    latitude: 22.6700,
    longitude: 92.1900,
    disease_type: 'Routine Checkup',
    age: 22,
    date: '2025-12-28',
    status: 'Normal'
  },
  {
    id: 5,
    name: 'Patient E',
    latitude: 22.6580,
    longitude: 92.1950,
    disease_type: 'Suspected Malaria',
    severity: 'Moderate',
    age: 31,
    date: '2025-12-26',
    status: 'Normal'
  }
]

const AdminDashboard = () => {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  
  // State
  const [patients, setPatients] = useState(initialPatients)
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'logistics'>('map')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [activeVolunteers] = useState(12)
  const [pendingSyncs] = useState(5)
  const [criticalAlerts, setCriticalAlerts] = useState(0)
  
  // Phase 7: Dispatch Workflow States
  const [showLogisticsModal, setShowLogisticsModal] = useState(false)
  const [isDispatched, setIsDispatched] = useState(false)

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
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleRunAI = async () => {
    if (!isConnected) {
      alert('Backend is offline. Cannot run AI analysis.')
      return
    }

    setIsAnalyzing(true)
    try {
      // Call the backend AI analysis endpoint
      const response = await axios.post('http://localhost:8000/api/analyze')
      const result = response.data
      
      setAiResult(result)
      
      if (result.cluster_detected) {
        // Update patients with AI results - turn markers RED for clustered patients
        const updatedPatients = result.data.map((patient: any) => ({
          id: patient.id || Math.random(),
          name: patient.name || `Patient ${patient.id}`,
          latitude: patient.lat,
          longitude: patient.lng,
          disease_type: patient.status === 'Critical' ? 'Confirmed Malaria Cluster' : 'Suspected Malaria',
          severity: patient.status === 'Critical' ? 'Critical' : 'Moderate',
          age: patient.age || 30,
          date: new Date().toISOString().split('T')[0],
          status: patient.status,
          cluster_id: patient.cluster_id
        }))
        
        setPatients(updatedPatients)
        
        // Count critical alerts
        const criticalCount = updatedPatients.filter((p: any) => p.status === 'Critical').length
        setCriticalAlerts(criticalCount)
        
        // Show success message
        setTimeout(() => {
          alert(`🚨 AI ANALYSIS COMPLETE!\n\n${result.message}\n\nCritical Patients: ${criticalCount}\nCluster Detected: YES`)
        }, 500)
      } else {
        alert('✅ AI Analysis Complete\n\nNo epidemic clusters detected.\nAll patients within normal distribution.')
      }
      
    } catch (error) {
      console.error('AI Analysis failed:', error)
      alert('❌ AI Analysis failed. Please check backend connection.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateRoute = () => {
    setShowLogisticsModal(true)
  }

  const handleDispatch = () => {
    setIsDispatched(true)
    setShowLogisticsModal(false)
    // Auto-hide success banner after 10 seconds
    setTimeout(() => {
      setIsDispatched(false)
    }, 10000)
  }

  const malariaCount = patients.filter(p => p.disease_type.includes('Malaria')).length
  const totalPatients = patients.length
  const criticalCount = patients.filter(p => p.status === 'Critical').length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">HillTrack</h1>
              <p className="text-sm text-gray-500 font-medium">Pulse Admin</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'logistics'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-semibold">Logistics</span>
            </button>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="px-4 py-2">
                <p className="text-xs text-gray-500 font-semibold mb-2">SYSTEM STATUS</p>
                <div className="flex items-center gap-2 text-sm">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-gray-50">
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold">LOGGED IN AS</p>
            <p className="font-semibold text-gray-800">{userType === 'admin' ? 'Administrator' : 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition shadow-lg shadow-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Admin Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">{backendStatus}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${
                  isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {isConnected ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className="font-semibold text-sm">
                    {isConnected ? 'Backend Online' : 'Backend Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* State 3: Success Banner */}
          {isDispatched && (
            <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-green-300 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">✅ Team Dispatched Successfully!</h3>
                  <p className="text-green-50 text-lg">Medical team en route to Jurachhari Village A Cluster. Route sent to volunteer mobile devices.</p>
                </div>
                <button
                  onClick={() => setIsDispatched(false)}
                  className="text-white hover:text-green-100 transition text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Top Cards - Premium Light Mode - All in a Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2">Active Volunteers</p>
                  <p className="text-5xl font-black text-blue-900">{activeVolunteers}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-lg p-6 border border-amber-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-2">Pending Syncs</p>
                  <p className="text-5xl font-black text-amber-900">{pendingSyncs}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <RefreshCw className="w-10 h-10 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl shadow-lg p-6 border border-rose-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-700 font-bold uppercase tracking-wide mb-2">Critical Alerts</p>
                  <p className="text-5xl font-black text-rose-900">{criticalAlerts}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <AlertTriangle className="w-10 h-10 text-rose-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Grid Layout with LiveFeed Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content - Takes 3 columns */}
            <div className="xl:col-span-3">
              {activeTab === 'map' && (
            <div className="relative">
              {/* Map Container */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-6 border-b bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Map className="w-8 h-8 text-emerald-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Live Surveillance Map</h3>
                        <p className="text-sm text-gray-600">
                          Real-time geospatial tracking • Rangamati Hill District
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Patients</p>
                      <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
                    </div>
                  </div>
                </div>

                <div className="relative" style={{ height: '600px' }}>
                  <HillMap patients={patients} />

                  {/* Floating AI Panel */}
                  <div className="absolute top-4 right-4 z-[1000]">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-300 max-w-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-8 h-8 text-purple-600" />
                        <div>
                          <h4 className="font-bold text-gray-800">AI Surveillance</h4>
                          <p className="text-xs text-gray-500">DBSCAN Clustering</p>
                        </div>
                      </div>

                      {aiResult && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          aiResult.cluster_detected 
                            ? 'bg-red-100 border border-red-300' 
                            : 'bg-green-100 border border-green-300'
                        }`}>
                          <p className={`text-sm font-semibold ${
                            aiResult.cluster_detected ? 'text-red-800' : 'text-green-800'
                          }`}>
                            {aiResult.cluster_detected ? '🚨 CLUSTER DETECTED' : '✅ NO CLUSTERS'}
                          </p>
                          <p className="text-xs text-gray-700 mt-1">
                            {aiResult.message}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleRunAI}
                        disabled={isAnalyzing || !isConnected}
                        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                          isAnalyzing 
                            ? 'bg-purple-400 cursor-wait' 
                            : !isConnected
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                        }`}
                      >
                        <Brain className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? 'ANALYZING...' : 'RUN AI SURVEILLANCE'}
                      </button>

                      {/* State 1: Show Generate Route button after cluster detected */}
                      {aiResult && aiResult.cluster_detected && !isDispatched && (
                        <button
                          onClick={handleGenerateRoute}
                          className="w-full mt-3 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg transition flex items-center justify-center gap-2 animate-pulse"
                        >
                          <Package className="w-5 h-5" />
                          GENERATE SUPPLY ROUTE
                        </button>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Algorithm:</span>
                            <span className="font-semibold text-gray-800">DBSCAN</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min Samples:</span>
                            <span className="font-semibold text-gray-800">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Epsilon:</span>
                            <span className="font-semibold text-gray-800">0.005 (~500m)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Panel Below Map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">Disease Distribution</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Malaria Cases</span>
                        <span className="text-sm font-bold text-red-600">{malariaCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all" 
                          style={{ width: `${(malariaCount / totalPatients) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Routine Checks</span>
                        <span className="text-sm font-bold text-green-600">{totalPatients - malariaCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all" 
                          style={{ width: `${((totalPatients - malariaCount) / totalPatients) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">Severity Breakdown</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Critical</span>
                      <span className="font-bold text-red-600">{criticalCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High Risk</span>
                      <span className="font-bold text-orange-600">
                        {patients.filter(p => p.severity === 'High').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Moderate</span>
                      <span className="font-bold text-yellow-600">
                        {patients.filter(p => p.severity === 'Moderate').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">System Status</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Backend API</span>
                      <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AI Model</span>
                      <span className="font-bold text-green-600">Ready</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Sync</span>
                      <span className="font-bold text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Medical Supply Route Optimization</h3>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">Optimal Route to Critical Zone</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Total Distance</p>
                    <p className="text-xl font-bold text-emerald-600">11.5 km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Est. Time</p>
                    <p className="text-xl font-bold text-blue-600">2.5 hrs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Transport Modes</p>
                    <p className="text-xl font-bold text-amber-600">3 Types</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Status</p>
                    <p className="text-xl font-bold text-rose-600">Ready</p>
                  </div>
                </div>
              </div>

              <div className="h-[600px] border border-gray-200 rounded-xl overflow-hidden">
                <LogisticsGraph />
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-gray-800 mb-3">Route Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Step 1:</span>
                    <span className="text-gray-600">Road transport from Upazila Health Complex (2.5 km)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Step 2:</span>
                    <span className="text-gray-600">Boat crossing via Kaptai Lake (5.8 km)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Step 3:</span>
                    <span className="text-gray-600">Hill trek to Village A Cluster (3.2 km)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>

            {/* LiveFeed Sidebar - Takes 1 column */}
            <div className="xl:col-span-1 hidden xl:block">
              <div className="sticky top-8" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                <LiveFeed />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* State 2: Logistics Modal */}
      {showLogisticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-8">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Medical Supply Route Optimization</h3>
                  <p className="text-sm text-gray-600">Optimal path to epidemic cluster</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogisticsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              {/* Travel Time Stats */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Route Summary</h4>
                <div className="grid grid-cols-4 gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Total Distance</p>
                    <p className="text-3xl font-bold text-emerald-600">11.5 km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Estimated Time</p>
                    <p className="text-3xl font-bold text-blue-600">3h 20m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Transport Modes</p>
                    <p className="text-3xl font-bold text-amber-600">3 Types</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Route Status</p>
                    <p className="text-3xl font-bold text-rose-600">Ready</p>
                  </div>
                </div>
              </div>

              {/* Logistics Graph */}
              <div className="h-[500px] border border-gray-200 rounded-xl overflow-hidden mb-6">
                <LogisticsGraph />
              </div>

              {/* Route Details */}
              <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Route Breakdown</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-gray-700 w-16">Step 1:</span>
                    <span className="text-gray-600">Road transport from Upazila Health Complex (2.5 km, ~30 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700 w-16">Step 2:</span>
                    <span className="text-gray-600">Boat crossing via Kaptai Lake (5.8 km, ~1h 30m)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <span className="font-medium text-gray-700 w-16">Step 3:</span>
                    <span className="text-gray-600">Hill trek to Village A Cluster (3.2 km, ~1h 20m)</span>
                  </div>
                </div>
              </div>

              {/* Dispatch Button */}
              <button
                onClick={handleDispatch}
                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition flex items-center justify-center gap-3"
              >
                <Package className="w-6 h-6" />
                DISPATCH MEDICAL TEAM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
