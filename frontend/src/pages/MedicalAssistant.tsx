import { useState, useEffect, useRef } from 'react'
import { Brain, Send, User, Loader2, AlertCircle, Sparkles, TrendingUp, Activity } from 'lucide-react'
import axios from 'axios'

interface PatientData {
  id: number
  name: string
  age: string
  symptoms: string
  severity: string
  status: string
  volunteerNotes: string
  medicalHistory: string
  location: string
  timestamp: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

const MedicalAssistant = () => {
  const [consultQueue, setConsultQueue] = useState<PatientData[]>([])
  const [activePatient, setActivePatient] = useState<PatientData | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load consultation queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('consultQueue')
    if (savedQueue) {
      setConsultQueue(JSON.parse(savedQueue))
    }
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSelectPatient = (patient: PatientData) => {
    setActivePatient(patient)
    setChatHistory([
      {
        role: 'system',
        content: `📋 Patient context loaded: ${patient.name}, ${patient.age} years old, presenting with ${patient.symptoms}. Severity: ${patient.severity}.`,
        timestamp: new Date().toISOString()
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setChatHistory(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/gemini-chat', {
        user_query: inputMessage,
        patient_data: activePatient
      })

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      }

      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date().toISOString()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAnalyze = () => {
    setInputMessage('Analyze the risk level for this patient and provide treatment recommendations.')
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleRemoveFromQueue = (patientId: number) => {
    const updatedQueue = consultQueue.filter(p => p.id !== patientId)
    setConsultQueue(updatedQueue)
    localStorage.setItem('consultQueue', JSON.stringify(updatedQueue))
    
    if (activePatient?.id === patientId) {
      setActivePatient(null)
      setChatHistory([])
    }
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Main Chat Area (Left/Center - 2/3) */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 border-b border-emerald-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Medical Consultant</h2>
                <p className="text-emerald-100 text-sm">
                  {activePatient ? `Consulting for: ${activePatient.name}` : 'Select a patient to begin consultation'}
                </p>
              </div>
            </div>
            {activePatient && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-semibold">
                  🌡️ {activePatient.symptoms}
                </span>
                <span className={`px-3 py-1 backdrop-blur-sm rounded-lg text-white text-sm font-bold ${
                  activePatient.severity === 'Critical' ? 'bg-red-500/80' :
                  activePatient.severity === 'High' ? 'bg-orange-500/80' :
                  activePatient.severity === 'Moderate' ? 'bg-yellow-500/80' :
                  'bg-green-500/80'
                }`}>
                  {activePatient.severity}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-semibold">
                  📍 {activePatient.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">AI Medical Consultation Ready</h3>
              <p className="text-gray-600 max-w-md">
                {activePatient 
                  ? 'Ask questions about diagnosis, treatment recommendations, or risk assessment.'
                  : 'Select a patient from the queue to start AI-powered medical consultation.'}
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl p-4 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    : msg.role === 'system'
                    ? 'bg-blue-50 border-2 border-blue-300 text-blue-800'
                    : 'bg-white border-2 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {msg.role === 'assistant' && (
                      <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                    )}
                    {msg.role === 'user' && (
                      <User className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    )}
                    {msg.role === 'system' && (
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <p className="text-gray-700 text-sm">AI is analyzing...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder={activePatient ? "Ask about diagnosis, treatment, or recommendations..." : "Select a patient first..."}
              disabled={!activePatient || isLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!activePatient || !inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Patient Queue Sidebar (Right - 1/3) */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Queue Header */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">Patient Queue</h3>
            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
              {consultQueue.length}
            </span>
          </div>
          <p className="text-gray-600 text-sm">Flagged for AI consultation</p>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {consultQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Sparkles className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm">No patients in queue</p>
              <p className="text-gray-500 text-xs mt-2">
                Flag patients from the data entry form
              </p>
            </div>
          ) : (
            consultQueue.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  activePatient?.id === patient.id
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{patient.name}</h4>
                    <p className="text-gray-600 text-xs">{patient.age} years old</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFromQueue(patient.id)
                    }}
                    className="text-gray-500 hover:text-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">{patient.symptoms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      patient.severity === 'Critical' ? 'bg-red-600 text-white' :
                      patient.severity === 'High' ? 'bg-orange-600 text-white' :
                      patient.severity === 'Moderate' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {patient.severity}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(patient.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {activePatient?.id === patient.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAnalyze()
                    }}
                    className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Quick Analyze
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalAssistant
