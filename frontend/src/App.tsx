import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Activity, BarChart3, Map, Settings } from 'lucide-react'
import axios from 'axios'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<string>('Loading...')
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
        console.error('Failed to connect to backend:', error)
      }
    }
    
    fetchStatus()
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-800">HillTrack Pulse</h1>
              </div>
              <nav className="flex gap-6">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link to="/map" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition">
                  <Map className="w-5 h-5" />
                  Map
                </Link>
                <Link to="/settings" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition">
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-6">
                {/* Backend Status Banner */}
                <div className={`rounded-lg shadow-lg p-8 text-center ${
                  isConnected 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-500 to-orange-600'
                }`}>
                  <h2 className="text-5xl font-bold text-white mb-2">
                    {backendStatus}
                  </h2>
                  <p className="text-white text-lg opacity-90">
                    {isConnected ? '✓ Connected to Backend API' : '✗ Backend Connection Failed'}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Welcome to HillTrack Pulse
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your comprehensive monitoring and analytics platform for the hackathon.
                  </p>
                  
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => setCount((count) => count + 1)}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-md"
                    >
                      Count is {count}
                    </button>
                    <p className="text-gray-500">
                      Click to test interactivity
                    </p>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <BarChart3 className="w-12 h-12 text-primary-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                    <p className="text-gray-600">Real-time data analytics and insights</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <Map className="w-12 h-12 text-primary-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Mapping</h3>
                    <p className="text-gray-600">Interactive geospatial visualization</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <Activity className="w-12 h-12 text-primary-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Monitoring</h3>
                    <p className="text-gray-600">Live system health monitoring</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/map" element={
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Map View</h2>
                <p className="text-gray-600">Map functionality will be implemented here</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-gray-600">Configure your preferences</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
