# HillMap Component

An interactive map component for visualizing patient data in Rangamati Hill District using React Leaflet.

## Features

- **Interactive Map**: Uses OpenStreetMap tiles centered on Rangamati [22.6533, 92.1789]
- **Dynamic Markers**: 
  - 🔴 **RED Pulsing Markers** for Critical Malaria cases
  - 🟢 **GREEN Static Markers** for Routine Checkups
- **Smart Popup**: Click markers to view detailed patient information
- **Auto-fitting Bounds**: Automatically adjusts view to show all patients
- **Live Legend**: Real-time count of malaria cases vs routine checkups
- **Responsive Design**: Works on all screen sizes

## Usage

```tsx
import HillMap from './components/HillMap'

const patients = [
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
    disease_type: 'Routine Checkup',
    age: 28,
    date: '2025-12-28'
  }
]

function MapPage() {
  return (
    <div style={{ height: '600px' }}>
      <HillMap patients={patients} />
    </div>
  )
}
```

## Patient Data Interface

```typescript
interface Patient {
  id: string | number          // Unique identifier
  name?: string                // Patient name (optional)
  latitude: number             // Latitude coordinate
  longitude: number            // Longitude coordinate
  disease_type: string         // Disease type (e.g., "Suspected Malaria")
  severity?: string            // Severity level (optional)
  age?: number                 // Patient age (optional)
  date?: string                // Visit/diagnosis date (optional)
}
```

## Malaria Detection

The component automatically detects malaria cases by checking if `disease_type` contains the word "malaria" (case-insensitive). These markers will:
- Display in RED color
- Animate with a pulsing effect
- Show in the legend as "Critical Malaria Cluster"

## Customization

### Change Map Center
```tsx
// In HillMap.tsx
const center: LatLngExpression = [22.6533, 92.1789] // Rangamati
```

### Adjust Zoom Level
```tsx
<MapContainer
  center={center}
  zoom={11}  // Change this value (1-18)
  ...
>
```

### Modify Marker Colors
```tsx
pathOptions={{
  fillColor: isMalaria ? '#ef4444' : '#22c55e',  // RED : GREEN
  color: isMalaria ? '#dc2626' : '#16a34a',
  ...
}}
```

## Dependencies

- `react-leaflet`: ^5.0.0
- `leaflet`: ^1.9.4
- `@types/leaflet`: ^1.9.14 (dev)

All dependencies are already included in package.json.

## Troubleshooting

**Map not displaying?**
- Ensure Leaflet CSS is imported in `index.css`
- Check that the container has a defined height
- Verify all coordinates are valid numbers

**Markers not showing?**
- Confirm patient array has valid latitude/longitude values
- Check that coordinates are in the correct format: [lat, lng]

**Pulsing not working?**
- Ensure patient `disease_type` contains "malaria" (case-insensitive)
- Check browser console for any errors

## Map View Route

Access the map at: `http://localhost:5173/map`
