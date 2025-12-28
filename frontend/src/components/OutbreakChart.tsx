import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, Download } from 'lucide-react'
import { useState } from 'react'

// Generate dummy data for the last 7 days
const data = [
  { day: 'Mon', malaria: 12, dengue: 8, flu: 15 },
  { day: 'Tue', malaria: 15, dengue: 8, flu: 13 },
  { day: 'Wed', malaria: 18, dengue: 9, flu: 11 },
  { day: 'Thu', malaria: 22, dengue: 8, flu: 9 },
  { day: 'Fri', malaria: 28, dengue: 9, flu: 7 },
  { day: 'Sat', malaria: 35, dengue: 8, flu: 5 },
  { day: 'Sun', malaria: 42, dengue: 9, flu: 3 },
]

const OutbreakChart = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:8000/api/generate-report')
      if (!response.ok) throw new Error('Failed to generate report')
      
      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HillTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please ensure backend is running.')
    } finally {
      setIsGenerating(false)
    }
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Disease Trend Analysis</h3>
        <p className="text-sm text-gray-600">Last 7 days • Real-time monitoring</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: '600' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: '600' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
          />
          <Line 
            type="monotone" 
            dataKey="malaria" 
            stroke="#ef4444" 
            strokeWidth={3}
            name="Malaria"
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="dengue" 
            stroke="#f97316" 
            strokeWidth={3}
            name="Dengue"
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="flu" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Normal Flu"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-xs text-gray-600">Malaria</p>
              <p className="text-lg font-bold text-red-600">↗ +250%</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <p className="text-xs text-gray-600">Dengue</p>
              <p className="text-lg font-bold text-orange-600">→ Stable</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-xs text-gray-600">Flu</p>
              <p className="text-lg font-bold text-green-600">↘ -80%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="mt-6">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Download className="w-5 h-5 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate PDF Report
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Download comprehensive analysis with AI insights
        </p>
      </div>
    </div>
  )
}

export default OutbreakChart
