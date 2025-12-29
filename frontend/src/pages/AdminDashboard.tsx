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
  RefreshCw,
  Terminal,
  Radio,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import HillMap from '../components/HillMap'
import LogisticsGraph from '../components/LogisticsGraph'
import LiveFeed from '../components/LiveFeed'
import OutbreakChart from '../components/OutbreakChart'
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

// Medical Teams stationed at different Upazila Health Complexes
const MEDICAL_TEAMS = [
  { id: "TEAM-A", name: "Rangamati Sadar Unit", lat: 22.6533, lng: 92.1789, status: "Available" },
  { id: "TEAM-B", name: "Kaptai Rapid Response", lat: 22.5000, lng: 92.2200, status: "Busy" },
  { id: "TEAM-C", name: "Jurachhari Field Unit", lat: 22.6700, lng: 92.4000, status: "Available" }
]

// Local Field Volunteers Database
const LOCAL_VOLUNTEERS = [
  { id: 'V-001', name: 'Abdul Karim', location: 'Jurachhari Valley', phone: '+880 1712-345678', status: 'Active' },
  { id: 'V-002', name: 'Fatima Begum', location: 'Jurachhari Valley', phone: '+880 1812-987654', status: 'Active' },
  { id: 'V-003', name: 'Mohammad Salim', location: 'Baghaichhari Hills', phone: '+880 1912-456789', status: 'Active' },
  { id: 'V-004', name: 'Taslima Khatun', location: 'Rangamati Upazila', phone: '+880 1612-345123', status: 'Active' },
  { id: 'V-005', name: 'Rashid Ahmed', location: 'Jurachhari Valley', phone: '+880 1512-789456', status: 'Active' },
  { id: 'V-006', name: 'Shirin Akter', location: 'Kaptai Lake North', phone: '+880 1712-890123', status: 'Active' },
  { id: 'V-007', name: 'Habibur Rahman', location: 'Belaichhari Remote', phone: '+880 1812-901234', status: 'Active' },
  { id: 'V-008', name: 'Ayesha Siddiqua', location: 'Baghaichhari Center', phone: '+880 1912-012345', status: 'Active' }
]

const AdminDashboard = () => {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  
  // State
  const [patients, setPatients] = useState(initialPatients)
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'logistics' | 'trends'>('map')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [activeVolunteers] = useState(12)
  const [pendingSyncs] = useState(5)
  const [criticalAlerts, setCriticalAlerts] = useState(0)
  const [activeClusters, setActiveClusters] = useState(0)
  const [teamsDeployed, setTeamsDeployed] = useState(0)
  
  // Phase 7: Dispatch Workflow States
  const [showLogisticsModal, setShowLogisticsModal] = useState(false)
  const [showMissionModal, setShowMissionModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [missionStatus, setMissionStatus] = useState<'idle' | 'dispatched' | 'resolved'>('idle')
  const [showLogisticsGraph, setShowLogisticsGraph] = useState(false)
  const [nearestTeamName, setNearestTeamName] = useState('')
  
  // Phase 8: Patient Manifest Modal States
  const [showManifestModal, setShowManifestModal] = useState(false)
  const [currentManifest, setCurrentManifest] = useState<any>(null)
  
  // Alert Modal States
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertContent, setAlertContent] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'info' })
  
  // SMS Gateway & System Logs
  const [systemLogs, setSystemLogs] = useState<{time: string, message: string, type: 'info' | 'success' | 'warning'}[]>([
    { time: new Date().toLocaleTimeString(), message: 'System initialized. GSM Gateway online.', type: 'info' },
    { time: new Date().toLocaleTimeString(), message: 'Connected to Grameenphone API (Backup: Robi, Banglalink)', type: 'info' }
  ])

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

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newLog = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }
    setSystemLogs(prev => [...prev, newLog])
  }

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertContent({ title, message, type })
    setShowAlertModal(true)
  }

  // Generate Patient Manifest for Dispatch
  const generateManifest = (clusterId: number) => {
    // Filter patients in the cluster (cluster_id !== -1)
    const clusterPatients = patients.filter(p => p.cluster_id !== undefined && p.cluster_id !== -1)
    
    if (clusterPatients.length === 0) {
      showAlert('No Cluster Detected', 'Please run AI analysis first to detect epidemic clusters.', 'error')
      return null
    }

    // Calculate required supplies based on symptoms and disease types
    const supplies: string[] = []
    
    // Count disease types and symptoms
    const feverCount = clusterPatients.filter(p => 
      p.disease_type?.toLowerCase().includes('malaria') || 
      p.disease_type?.toLowerCase().includes('fever')
    ).length
    
    const rashCount = clusterPatients.filter(p => 
      p.disease_type?.toLowerCase().includes('dengue') || 
      p.disease_type?.toLowerCase().includes('rash')
    ).length
    
    // Supply logic
    if (feverCount > 0) {
      supplies.push(`Paracetamol (${feverCount * 10} tablets)`)
      supplies.push(`Antimalarial Medication (${feverCount * 5} doses)`)
    }
    
    if (rashCount > 0) {
      supplies.push(`Dengue Test Kits (${rashCount} units)`)
      supplies.push(`IV Fluids (${rashCount * 2} bags)`)
    }
    
    // Always include basics
    supplies.push(`Medical Gloves (${clusterPatients.length * 2} pairs)`)
    supplies.push(`Sterile Syringes (${clusterPatients.length * 3} units)`)
    supplies.push(`Diagnostic Equipment (1 kit)`)
    
    // Get cluster location
    const clusterLocation = clusterPatients[0]
    const targetVillage = clusterLocation.latitude > 22.66 
      ? 'Jurachhari Valley' 
      : clusterLocation.latitude > 22.65
      ? 'Baghaichhari Hills'
      : 'Rangamati Upazila'
    
    // Filter field volunteers by location
    const fieldAgents = LOCAL_VOLUNTEERS.filter(v => v.location === targetVillage)
    
    // Generate manifest
    const manifest = {
      missionId: `MISSION-${Math.floor(Math.random() * 9000) + 1000}`,
      clusterId: `CLUSTER-${clusterId || 402}`,
      targetVillage,
      coordinates: {
        lat: clusterLocation.latitude.toFixed(4),
        lng: clusterLocation.longitude.toFixed(4)
      },
      patientCount: clusterPatients.length,
      patients: clusterPatients.map(p => ({
        name: p.name,
        age: p.age,
        diseaseType: p.disease_type,
        severity: p.severity,
        status: p.status
      })),
      requiredSupplies: supplies,
      fieldAgents: fieldAgents,
      timestamp: new Date().toISOString(),
      priority: clusterPatients.filter(p => p.status === 'Critical').length > 0 ? 'HIGH' : 'MEDIUM'
    }
    
    return manifest
  }

  const handleRunAI = async () => {
    if (!isConnected) {
      showAlert('Backend Offline', 'Cannot run AI analysis. Please check backend connection.', 'error')
      return
    }

    setIsAnalyzing(true)
    try {
      // Call the backend AI analysis endpoint
      const response = await axios.post('http://localhost:8000/api/analyze')
      const result = response.data
      
      setAiResult(result)
      
      if (result.cluster_detected) {
        addLog(`AI ALERT: Epidemic cluster detected (${result.data.filter((p: any) => p.cluster_id !== -1).length} patients)`, 'warning')
        addLog('DBSCAN analysis complete. Cluster ID: #CLUSTER-402', 'info')
        
        // Increment active clusters count
        setActiveClusters(prev => prev + 1)
        
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
        
        // Show success message in UI
        setTimeout(() => {
          showAlert(
            '🚨 AI ANALYSIS COMPLETE',
            `${result.message}\n\nCritical Patients: ${criticalCount}\nCluster Detected: YES`,
            'info'
          )
        }, 500)
      } else {
        showAlert(
          '✅ AI Analysis Complete',
          'No epidemic clusters detected.\nAll patients within normal distribution.',
          'success'
        )
      }
      
    } catch (error) {
      console.error('AI Analysis failed:', error)
      showAlert('❌ AI Analysis Failed', 'Please check backend connection and try again.', 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateRoute = () => {
    // Generate manifest for the cluster
    const manifest = generateManifest(402)
    if (manifest) {
      setCurrentManifest(manifest)
      setShowManifestModal(true)
      addLog(`Manifest generated: ${manifest.missionId}`, 'info')
    }
  }
  
  const handleConfirmManifest = () => {
    // Close manifest modal and open logistics modal
    setShowManifestModal(false)
    setShowLogisticsModal(true)
    addLog(`Manifest ${currentManifest.missionId} confirmed. Proceeding to dispatch...`, 'success')
  }

  // Find nearest available medical team to the cluster location
  const findNearestTeam = (targetLat: number, targetLng: number) => {
    // Filter for available teams only
    const availableTeams = MEDICAL_TEAMS.filter(team => team.status === "Available")
    
    if (availableTeams.length === 0) {
      return MEDICAL_TEAMS[0] // Fallback to first team if none available
    }
    
    // Calculate distance for each team and find the closest
    let nearestTeam = availableTeams[0]
    let minDistance = Infinity
    
    availableTeams.forEach(team => {
      // Simple Euclidean distance (good enough for small regions)
      const distance = Math.sqrt(
        Math.pow(team.lat - targetLat, 2) + Math.pow(team.lng - targetLng, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearestTeam = team
      }
    })
    
    return { team: nearestTeam, distance: (minDistance * 111).toFixed(1) } // Convert to km (rough)
  }

  const handleMissionAction = () => {
    if (missionStatus === 'idle') {
      // Step 1: Dispatch team with AI Logistics Optimization
      setShowLogisticsModal(false)
      setIsLoading(true)
      
      addLog('Running AI logistics optimization...', 'info')
      
      setTimeout(() => {
        // Get cluster location (from AI result or default)
        const clusterLocation = aiResult?.data?.[0] 
          ? { lat: aiResult.data[0].lat, lng: aiResult.data[0].lng }
          : { lat: 22.6700, lng: 92.4000 } // Default to Jurachhari Valley
        
        // AI Logic: Find nearest available team
        const { team, distance } = findNearestTeam(clusterLocation.lat, clusterLocation.lng)
        
        // Show logistics graph and set team name
        setShowLogisticsGraph(true)
        setNearestTeamName(team.name)
        
        // Increment teams deployed count
        setTeamsDeployed(prev => prev + 1)
        
        addLog(`AI selected nearest unit: ${team.name} (${distance} km away)`, 'success')
        
        // Simulate SMS Gateway API call
        const smsPayload = {
          recipient: `+88017*** (${team.id} Leader)`,
          message: `🚨 EMERGENCY DISPATCH\nMission: #CLUSTER-402\nLocation: Jurachhari Valley\nCoords: ${clusterLocation.lat}, ${clusterLocation.lng}\nPriority: HIGH\nPatients: 5\nRoute: See App`,
          gateway: 'Grameenphone SMS API',
          clusterId: '#CLUSTER-402'
        }
        
        addLog(`GATEWAY: Sending SMS to ${smsPayload.recipient}`, 'warning')
        addLog(`PAYLOAD: Mission ${smsPayload.clusterId} | Coords: ${clusterLocation.lat}, ${clusterLocation.lng}`, 'info')
        addLog(`SMS delivered via ${smsPayload.gateway} ✓`, 'success')
        addLog('Field team notified. Awaiting confirmation...', 'info')
        
        setIsLoading(false)
        setMissionStatus('dispatched')
        
        // Show AI-optimized dispatch notification in UI
        showAlert(
          '🤖 AI LOGISTICS OPTIMIZED',
          `Cluster Location: Jurachhari Valley\n` +
          `Coordinates: ${clusterLocation.lat}, ${clusterLocation.lng}\n\n` +
          `Nearest Available Unit: ${team.name}\n` +
          `Team ID: ${team.id}\n` +
          `Distance: ~${distance} km (River Route)\n` +
          `Status: ${team.status}\n\n` +
          `>> DISPATCHING ${team.id} IMMEDIATELY\n\n` +
          `📨 SMS sent via Grameenphone API\n` +
          `(Fallback: Robi, Banglalink)`,
          'success'
        )
        
        setToastMessage(`⚠️ ${team.name} En Route to Cluster #402`)
        setShowToast(true)
        
        setTimeout(() => setShowToast(false), 3000)
        
        // Simulate field team acknowledgment
        setTimeout(() => {
          addLog(`SMS ACK received from ${team.id} (+88017***)`, 'success')
          addLog('Team departed from Upazila Health Complex', 'info')
        }, 3000)
      }, 1500)
    } else if (missionStatus === 'dispatched') {
      // Step 2: Mark mission complete
      setIsLoading(true)
      
      addLog('Receiving mission completion report...', 'info')
      
      setTimeout(() => {
        addLog('All 5 patients treated successfully', 'success')
        addLog('Antimalarial medication distributed', 'success')
        addLog('Mission #CLUSTER-402 marked COMPLETE', 'success')
        
        // Decrement active clusters and teams deployed
        setActiveClusters(prev => Math.max(0, prev - 1))
        setTeamsDeployed(prev => Math.max(0, prev - 1))
        
        setIsLoading(false)
        setMissionStatus('resolved')
        setShowMissionModal(true)
      }, 1000)
    }
    // Step 3: If resolved, do nothing
  }

  const malariaCount = patients.filter(p => p.disease_type.includes('Malaria')).length
  const totalPatients = patients.length
  const criticalCount = patients.filter(p => p.status === 'Critical').length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar - Fixed Position */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl overflow-y-auto">
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

            <button
              onClick={() => setActiveTab('trends')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'trends'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">Trends</span>
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

            {/* AI Surveillance Panel */}
            <div className="pt-8 mt-4 border-t border-gray-200">
              <div className="px-2">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-2 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">AI Surveillance</h4>
                      <p className="text-xs text-gray-500">DBSCAN Clustering</p>
                    </div>
                  </div>

                  {aiResult && (
                    <div className={`mb-3 p-2 rounded-lg text-xs ${
                      aiResult.cluster_detected 
                        ? 'bg-red-100 border border-red-300' 
                        : 'bg-green-100 border border-green-300'
                    }`}>
                      <p className={`font-semibold ${
                        aiResult.cluster_detected ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {aiResult.cluster_detected ? '🚨 CLUSTER' : '✅ CLEAR'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleRunAI}
                    disabled={isAnalyzing || !isConnected}
                    className={`w-full py-2 rounded-lg font-semibold text-white text-xs transition flex items-center justify-center gap-2 ${
                      isAnalyzing 
                        ? 'bg-purple-400 cursor-wait' 
                        : !isConnected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    }`}
                  >
                    <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'ANALYZING...' : 'RUN AI'}
                  </button>

                  {aiResult && aiResult.cluster_detected && (
                    <button
                      onClick={missionStatus === 'idle' ? handleGenerateRoute : handleMissionAction}
                      disabled={isLoading}
                      className={`w-full mt-2 py-2 rounded-lg font-semibold text-white text-xs transition flex items-center justify-center gap-2 ${
                        missionStatus === 'resolved' 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 cursor-default' 
                          : missionStatus === 'dispatched'
                          ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 animate-pulse'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 animate-pulse'
                      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          LOADING...
                        </>
                      ) : missionStatus === 'resolved' ? (
                        <>
                          🎉 OUTBREAK RESOLVED
                        </>
                      ) : missionStatus === 'dispatched' ? (
                        <>
                          ⏳ MARK COMPLETE
                        </>
                      ) : (
                        <>
                          🚨 DISPATCH TEAM
                        </>
                      )}
                    </button>
                  )}

                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="space-y-1 text-xs">
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
                        <span className="font-semibold text-gray-800">500m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Logged as</p>
            <p className="font-semibold text-gray-800 text-sm">{userType === 'admin' ? 'Administrator' : 'User'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content - Add left margin to account for fixed sidebar */}
      <main className="flex-1 ml-64 overflow-y-auto">
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-semibold text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Top Cards - Premium Light Mode - 4 Stat Cards with Trend Indicators */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl shadow-lg p-6 border border-rose-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-rose-700 font-bold uppercase tracking-wide mb-2">Total Cases</p>
                  <p className="text-5xl font-black text-rose-900">{patients.length}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Activity className="w-10 h-10 text-rose-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-rose-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+12% vs yesterday</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-lg p-6 border border-amber-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-2">Active Clusters</p>
                  <p className="text-5xl font-black text-amber-900">{activeClusters}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <MapPin className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <div className="text-sm text-amber-700 font-semibold">
                Jurachhari, Baghaichhari
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2">Teams Deployed</p>
                  <p className="text-5xl font-black text-blue-900">{teamsDeployed}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-blue-700 font-semibold">
                Team-A, Team-C Active
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg p-6 border border-emerald-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-2">Avg Response</p>
                  <p className="text-5xl font-black text-emerald-900">4h15m</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Clock className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-bold">-10% improvement</span>
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
                  <HillMap patients={patients} missionStatus={missionStatus} isScanning={isAnalyzing} />
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
              
              {!showLogisticsGraph ? (
                <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-600 mb-2">Logistics Route Not Generated</h4>
                    <p className="text-gray-500">Run AI analysis and dispatch a team to see the optimized route</p>
                  </div>
                </div>
              ) : (
                <>
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
                    <LogisticsGraph sourceName={nearestTeamName} />
                  </div>
                </>
              )}

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

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Disease Outbreak Trends</h3>
                  <p className="text-sm text-gray-600">7-Day Analysis</p>
                </div>
              </div>
              <OutbreakChart />
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

      {/* Patient Manifest Modal */}
      {showManifestModal && currentManifest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-8">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-b border-red-700 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">📋</div>
                  <div>
                    <h3 className="text-3xl font-black">PATIENT MANIFEST</h3>
                    <p className="text-red-100 text-sm font-semibold">Targeted Mission Dispatch Document</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManifestModal(false)}
                  className="text-white hover:text-red-200 transition text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Mission Header */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mission ID</p>
                    <p className="text-2xl font-black text-red-600 font-mono">{currentManifest.missionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Cluster ID</p>
                    <p className="text-2xl font-black text-orange-600 font-mono">{currentManifest.clusterId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Target Village</p>
                    <p className="text-xl font-bold text-gray-800">📍 {currentManifest.targetVillage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Priority Level</p>
                    <p className={`text-xl font-black ${
                      currentManifest.priority === 'HIGH' ? 'text-red-600' : 'text-yellow-600'
                    }`}>🚨 {currentManifest.priority}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">GPS Coordinates</p>
                  <p className="text-lg font-mono text-gray-800">
                    {currentManifest.coordinates.lat}°N, {currentManifest.coordinates.lng}°E
                  </p>
                </div>
              </div>

              {/* Patient List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    👥 PATIENT LIST
                    <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      {currentManifest.patientCount} Patients
                    </span>
                  </h4>
                </div>
                
                <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Patient Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Age</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Disease Type</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Severity</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentManifest.patients.map((patient: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-bold text-gray-700">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{patient.diseaseType}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                patient.severity === 'High' || patient.severity === 'Critical'
                                  ? 'bg-red-100 text-red-700'
                                  : patient.severity === 'Moderate'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {patient.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                patient.status === 'Critical'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {patient.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Required Supplies */}
              <div className="mb-6">
                <h4 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  📦 REQUIRED SUPPLIES
                  <span className="text-sm font-normal text-gray-500">(AI-Calculated)</span>
                </h4>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentManifest.requiredSupplies.map((supply: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-blue-200">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-800">{supply}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-blue-300">
                    <p className="text-xs text-blue-700 font-semibold">
                      ℹ️ Supply calculation based on patient symptoms and disease types
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Field Agents in Zone */}
              {currentManifest.fieldAgents && currentManifest.fieldAgents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    👥 ACTIVE FIELD AGENTS IN ZONE
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                      {currentManifest.fieldAgents.length} Available
                    </span>
                  </h4>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6">
                    <div className="space-y-3">
                      {currentManifest.fieldAgents.map((agent: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-emerald-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{agent.name}</p>
                              <p className="text-xs text-gray-600">{agent.id} • {agent.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              agent.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {agent.status}
                            </span>
                            <a 
                              href={`tel:${agent.phone}`}
                              className="font-mono text-sm text-emerald-600 hover:text-emerald-800 font-semibold"
                            >
                              {agent.phone}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-emerald-300">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-emerald-700 font-semibold">
                          ℹ️ These volunteers are on the ground and will coordinate with the medical team
                        </p>
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold text-sm transition-all shadow-md">
                          📢 Notify All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mission Info */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="font-bold text-yellow-900 text-sm">MISSION BRIEFING</p>
                    <p className="text-yellow-800 text-xs mt-1">
                      This is a <span className="font-bold">{currentManifest.priority} PRIORITY</span> medical dispatch to {currentManifest.targetVillage}. 
                      Team must carry all listed supplies and be prepared for {currentManifest.patientCount} patient interactions. 
                      Estimated mission duration: 6-8 hours including travel and treatment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowManifestModal(false)}
                  className="py-4 rounded-xl font-bold text-gray-700 text-lg bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 shadow-lg transition"
                >
                  ❌ CANCEL
                </button>
                <button
                  onClick={handleConfirmManifest}
                  className="py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition flex items-center justify-center gap-3"
                >
                  ✅ CONFIRM & TRANSMIT
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Manifest generated at {new Date(currentManifest.timestamp).toLocaleString()} • HillTrack Pulse Command Center
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Modal */}
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
                <LogisticsGraph sourceName={nearestTeamName} />
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
                onClick={handleMissionAction}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    DISPATCHING...
                  </>
                ) : (
                  <>
                    <Package className="w-6 h-6" />
                    DISPATCH MEDICAL TEAM
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Success Modal */}
      {showMissionModal && missionStatus === 'resolved' && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[3000] p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-4 border-green-500 transform animate-bounce-in">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">✅</div>
                  <div>
                    <h2 className="text-3xl font-black">MISSION COMPLETE</h2>
                    <p className="text-green-100 text-sm">Cluster Contained Successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMissionModal(false)}
                  className="text-white hover:text-green-200 transition text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Success Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <div className="text-6xl">🎉</div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">OUTBREAK RESOLVED</h3>
                  <p className="text-gray-600">Medical team has successfully contained Cluster #402</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mission ID</p>
                    <p className="text-2xl font-black text-gray-800 font-mono">#ALPHA-99</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                    <p className="text-2xl font-black text-green-600">✅ COMPLETE</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-300">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Destination</p>
                  <p className="text-xl font-bold text-gray-800 mb-3">📍 Jurachhari Valley Cluster</p>
                  
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Route Plan</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">1.</span>
                      <span className="text-gray-700">Upazila Health Complex</span>
                      <span className="text-gray-400">→</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span className="text-gray-700">Kaptai Lake Boat Terminal</span>
                      <span className="text-gray-400">→</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">3.</span>
                      <span className="text-gray-700">Jurachhari Base Camp</span>
                      <span className="text-gray-400">→</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">4.</span>
                      <span className="text-gray-700 font-bold">Critical Zone (Village A)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-300">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Estimated Arrival</p>
                  <p className="text-lg font-bold text-gray-800">3h 20min</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-lg">✅ ALL PATIENTS TREATED</p>
                    <p className="text-green-700 text-sm">Antimalarial medication distributed. Follow-up scheduled.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowMissionModal(false)}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition"
              >
                CLOSE MISSION REPORT
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Mission created at {new Date().toLocaleTimeString()} • HillTrack Pulse Command Center
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 z-[5000] animate-slide-in">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl shadow-2xl p-4 border-2 border-yellow-300 max-w-md">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="font-bold text-lg">{toastMessage}</p>
                <p className="text-yellow-100 text-sm">Track progress on the live map</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-white hover:text-yellow-100 transition text-xl font-bold ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[6000] p-8">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-4 ${
            alertContent.type === 'success' ? 'border-green-500' :
            alertContent.type === 'error' ? 'border-red-500' :
            'border-blue-500'
          }`}>
            <div className={`p-6 rounded-t-2xl ${
              alertContent.type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
              alertContent.type === 'error' ? 'bg-gradient-to-r from-red-600 to-rose-600' :
              'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {alertContent.type === 'success' ? '✅' :
                     alertContent.type === 'error' ? '❌' : 'ℹ️'}
                  </div>
                  <h2 className="text-2xl font-black">{alertContent.title}</h2>
                </div>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="text-white hover:opacity-75 transition text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className={`p-6 rounded-xl border-2 ${
                alertContent.type === 'success' ? 'bg-green-50 border-green-200' :
                alertContent.type === 'error' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-gray-800 whitespace-pre-line text-lg leading-relaxed">
                  {alertContent.message}
                </p>
              </div>

              <button
                onClick={() => setShowAlertModal(false)}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-lg transition ${
                  alertContent.type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                  alertContent.type === 'error' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' :
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
