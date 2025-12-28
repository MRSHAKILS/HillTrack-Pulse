import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Define node types with specific styling
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="text-center">
          <div className="text-xs font-bold text-green-800 mb-1">MAIN HUB</div>
          <div className="text-sm font-semibold">Upazila Health Complex</div>
          <div className="text-xs text-green-600 mt-1">📦 Medical Supplies</div>
        </div>
      ) 
    },
    position: { x: 50, y: 150 },
    style: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      border: '3px solid #10b981',
      borderRadius: '16px',
      padding: '20px',
      width: 200,
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
  },
  {
    id: '2',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="text-xs font-bold text-blue-800 mb-1">WATER TRANSPORT</div>
          <div className="text-sm font-semibold">Kaptai Lake Crossing</div>
          <div className="text-xs text-blue-600 mt-1">🚤 Boat Terminal</div>
        </div>
      ) 
    },
    position: { x: 350, y: 150 },
    style: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      border: '3px solid #3b82f6',
      borderRadius: '16px',
      padding: '20px',
      width: 200,
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    },
  },
  {
    id: '3',
    type: 'default',
    data: { 
      label: (
        <div className="text-center">
          <div className="text-xs font-bold text-amber-800 mb-1">STAGING AREA</div>
          <div className="text-sm font-semibold">Jurachhari Landing</div>
          <div className="text-xs text-amber-600 mt-1">⛺ Base Camp</div>
        </div>
      ) 
    },
    position: { x: 650, y: 150 },
    style: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '3px solid #f59e0b',
      borderRadius: '16px',
      padding: '20px',
      width: 200,
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    },
  },
  {
    id: '4',
    type: 'output',
    data: { 
      label: (
        <div className="text-center">
          <div className="text-xs font-bold text-red-800 mb-1 animate-pulse">⚠️ CRITICAL ZONE ⚠️</div>
          <div className="text-sm font-semibold">Village A Cluster</div>
          <div className="text-xs text-red-600 mt-1">🚨 Epidemic Detected</div>
        </div>
      ) 
    },
    position: { x: 950, y: 150 },
    style: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      border: '3px solid #ef4444',
      borderRadius: '16px',
      padding: '20px',
      width: 200,
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    className: 'animate-pulse',
  },
]

// Define edges with animation
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
    },
    label: '2.5 km',
    labelStyle: { fill: '#10b981', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
    label: '5.8 km',
    labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#f59e0b',
    },
    label: '3.2 km',
    labelStyle: { fill: '#f59e0b', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
  },
]

const LogisticsGraph = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Fit view on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const fitViewButton = document.querySelector('.react-flow__controls-fitview')
      if (fitViewButton instanceof HTMLButtonElement) {
        fitViewButton.click()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ width: '100%', height: '500px' }} className="rounded-xl overflow-hidden border-2 border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '4px',
          }}
        />
      </ReactFlow>
    </div>
  )
}

export default LogisticsGraph
