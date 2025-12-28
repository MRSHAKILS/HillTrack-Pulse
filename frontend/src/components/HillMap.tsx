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
}

interface HillMapProps {
  patients: Patient[]
}

// Component to animate pulsing markers
const PulsingMarker = ({ patient }: { patient: Patient }) => {
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

  const isMalaria = patient.disease_type.toLowerCase().includes('malaria')
  const position: LatLngExpression = [patient.latitude, patient.longitude]

  return (
    <CircleMarker
      center={position}
      radius={isMalaria ? radius : 8}
      pathOptions={{
        fillColor: isMalaria ? '#ef4444' : '#22c55e',
        color: isMalaria ? '#dc2626' : '#16a34a',
        weight: 2,
        opacity: isMalaria ? 0.8 : 0.7,
        fillOpacity: isMalaria ? 0.6 : 0.5,
      }}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-bold text-base mb-2">
            {patient.name || `Patient #${patient.id}`}
          </h3>
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

const HillMap = ({ patients }: HillMapProps) => {
  const center: LatLngExpression = [22.6533, 92.1789] // Rangamati coordinates

  const malariaCount = patients.filter((p) => 
    p.disease_type.toLowerCase().includes('malaria')
  ).length

  const routineCount = patients.length - malariaCount

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
            <PulsingMarker key={patient.id} patient={patient} />
          ))}

          {/* Auto-fit bounds if patients exist */}
          {patients.length > 0 && <MapBounds patients={patients} />}
        </>
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000] border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Map Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">
              🔴 Critical Malaria Cluster ({malariaCount})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-700">
              🟢 Routine Checkup ({routineCount})
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
