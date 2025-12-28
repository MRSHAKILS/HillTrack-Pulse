import { useState, useEffect } from 'react'
import { Activity, Clock, MapPin, User, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface Report {
  patient_name: string
  disease: string
  location: string
  volunteer_id: string
  timestamp: string
  severity: string
}

const LiveFeed = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/recent-reports')
      setReports(response.data.reports)
      setLastUpdate(new Date())
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchReports()

    // Poll every 5 seconds
    const interval = setInterval(fetchReports, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-800">Live Feed</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(lastUpdate.toISOString())}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">Real-time field reports</p>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">No reports yet</p>
          </div>
        ) : (
          reports.map((report, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-600" />
                    <h4 className="font-bold text-gray-800">{report.patient_name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{report.location}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getSeverityColor(report.severity)}`}>
                  {report.severity}
                </span>
              </div>
              
              <div className="bg-blue-50 rounded-lg px-3 py-2 mb-2">
                <p className="text-sm font-semibold text-blue-800">{report.disease}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono">{report.volunteer_id}</span>
                <span>{formatTimestamp(report.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Reports</span>
          <span className="font-bold text-emerald-600">{reports.length}</span>
        </div>
      </div>
    </div>
  )
}

export default LiveFeed
