import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SimpleMap = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[22.6533, 92.1789]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[22.6533, 92.1789]}>
            <Popup>Rangamati, Bangladesh</Popup>
          </Marker>
        </>
      </MapContainer>
    </div>
  )
}

export default SimpleMap
