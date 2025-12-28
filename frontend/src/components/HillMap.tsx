import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L, { LatLngExpression, latLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../leaflet-custom.css'

// Fix for default marker icon issue in production
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Patient interface
interface Patient {
  id: string | number
  name?: string
  latitude: number
  longitude: number
  disease_type: string
  severity?: string
  age?: number
  date?: string
  cluster_id?: number
}

interface HillMapProps {
  patients: Patient[]
  missionStatus?: 'idle' | 'dispatched' | 'resolved'
}

// Component to animate pulsing markers
const PulsingMarker = ({ patient, missionStatus }: { patient: Patient; missionStatus?: 'idle' | 'dispatched' | 'resolved' }) => {
  const [radius, setRadius] = useState(8)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setRadius((prev) => {
        const newRadius = prev + direction * 1.5
        if (newRadius >= 15 || newRadius <= 8) {
          setDirection((d) => -d)
        }
        return newRadius
      })
    }, 100)

    return () => clearInterval(interval)
  }, [direction])

  const position: LatLngExpression = [patient.latitude, patient.longitude]
  
  // Check if patient is part of a cluster (AI-detected outbreak zone)
  const isCluster = patient.cluster_id !== undefined && patient.cluster_id !== -1

  // Determine marker color based on cluster status and mission lifecycle
  const getMarkerColor = () => {
    if (isCluster) {
      // This patient is in an AI-detected cluster - apply 3-stage lifecycle
      if (missionStatus === 'resolved') {
        // Stage 3: Resolved = Green (Success)
        return {
          fillColor: '#22c55e',
          color: '#16a34a',
          statusText: 'Outbreak Resolved',
          shouldPulse: false
        }
      } else if (missionStatus === 'dispatched') {
        // Stage 2: Dispatched = Yellow (In Progress)
        return {
          fillColor: '#fbbf24',
          color: '#f59e0b',
          statusText: 'Medical Team En Route',
          shouldPulse: false
        }
      } else {
        // Stage 1: Idle = Red (Danger/Unattended)
        return {
          fillColor: '#ef4444',
          color: '#dc2626',
          statusText: 'Critical - Awaiting Response',
          shouldPulse: true
        }
      }
    } else {
      // Not in cluster = Blue/Green (Standard/Safe)
      return {
        fillColor: '#3b82f6',
        color: '#2563eb',
        statusText: 'Routine Checkup',
        shouldPulse: false
      }
    }
  }

  const markerStyle = getMarkerColor()

  return (
    <CircleMarker
      center={position}
      radius={markerStyle.shouldPulse ? radius : 8}
      pathOptions={{
        fillColor: markerStyle.fillColor,
        color: markerStyle.color,
        weight: 2,
        opacity: markerStyle.shouldPulse ? 0.9 : 0.7,
        fillOpacity: markerStyle.shouldPulse ? 0.7 : 0.5,
      }}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-bold text-base mb-2">
            {patient.name || `Patient #${patient.id}`}
          </h3>
          
          {/* Mission Status Badge - Shows for all clustered patients */}
          {isCluster && (
            <div className={`mb-3 p-2 rounded-lg ${
              missionStatus === 'resolved'
                ? 'bg-green-100 border border-green-400'
                : missionStatus === 'dispatched' 
                ? 'bg-yellow-100 border border-yellow-400' 
                : 'bg-red-100 border border-red-400'
            }`}>
              <p className={`text-xs font-bold ${
                missionStatus === 'resolved'
                  ? 'text-green-800'
                  : missionStatus === 'dispatched'
                  ? 'text-yellow-800' 
                  : 'text-red-800'
              }`}>
                {missionStatus === 'resolved' ? '✅' : missionStatus === 'dispatched' ? '🚑' : '🚨'} {markerStyle.statusText}
              </p>
            </div>
          )}
          
          <p className="mb-1">
            <span className="font-semibold">Disease:</span> {patient.disease_type}
          </p>
          {patient.severity && (
            <p className="mb-1">
              <span className="font-semibold">Severity:</span> {patient.severity}
            </p>
          )}
          {patient.age && (
            <p className="mb-1">
              <span className="font-semibold">Age:</span> {patient.age}
            </p>
          )}
          {patient.date && (
            <p className="mb-1">
              <span className="font-semibold">Date:</span> {patient.date}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            📍 {patient.latitude.toFixed(4)}, {patient.longitude.toFixed(4)}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  )
}

// Map bounds setter
const MapBounds = ({ patients }: { patients: Patient[] }) => {
  const map = useMap()

  useEffect(() => {
    if (patients.length > 0) {
      const bounds = patients.map((p) => [p.latitude, p.longitude]) as [number, number][]
      map.fitBounds(latLngBounds(bounds), { padding: [50, 50] })
    }
  }, [patients, map])

  return null
}

const HillMap = ({ patients, missionStatus = 'idle' }: HillMapProps) => {
  const center: LatLngExpression = [22.6533, 92.1789] // Rangamati coordinates

  // Count only patients in clusters (outbreak zones)
  const clusterCount = patients.filter((p) => 
    p.cluster_id !== undefined && p.cluster_id !== -1
  ).length

  const routineCount = patients.length - clusterCount

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '500px', zIndex: 0 }}
        className="rounded-lg shadow-lg"
      >
        <>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Render all patient markers */}
          {patients.map((patient) => (
            <PulsingMarker key={patient.id} patient={patient} missionStatus={missionStatus} />
          ))}

          {/* Auto-fit bounds if patients exist */}
          {patients.length > 0 && <MapBounds patients={patients} />}
        </>
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000] border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Map Legend</h3>
        <div className="space-y-2">
          {clusterCount > 0 && (
            missionStatus === 'resolved' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-gray-700">
                  ✅ Outbreak Resolved ({clusterCount})
                </span>
              </div>
            ) : missionStatus === 'dispatched' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-xs font-medium text-gray-700">
                  🚑 Team En Route ({clusterCount})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">
                  🚨 Outbreak Zone ({clusterCount})
                </span>
              </div>
            )
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700">
              📋 Routine Patients ({routineCount})
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Total Patients:</span> {patients.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📍 Rangamati Hill District
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      {patients.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[999] rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 font-medium">No patient data to display</p>
            <p className="text-gray-400 text-sm mt-1">Add patient data to see locations</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HillMap
