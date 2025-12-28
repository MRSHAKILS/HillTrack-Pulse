# 🏔️ HillTrack Pulse

**Real-Time Healthcare Monitoring System for Rangamati Hill District**

A cutting-edge healthcare surveillance platform designed to overcome the unique challenges of Bangladesh's Chittagong Hill Tracts—limited internet connectivity, difficult terrain, and resource logistics—by combining offline-first data collection with AI-powered epidemic detection and intelligent supply chain optimization.

---

## 📋 Table of Contents
- [Team Information](#team-information)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [AI Tools Disclosure](#ai-tools-disclosure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Demo Credentials](#demo-credentials)
- [Future Enhancements](#future-enhancements)
- [Team & Acknowledgments](#team--acknowledgments)





---

## 👥 Team Information

**Team Name:**  
`NSU_BUET_AIUB.exe`

**Team Members:**

| Name | Role | Institution | Email |
|-----|------ |-------------|-------|
| Shakil Ahmed| NSU        |   itshakilbd@gmail.com.com |
| Shahriar Ahmed Seam | BUET | shahriarseam17@gmail.com.com |
| Khaled Saifullah | AIUB    | khaledsaifullah50956@gmail.com |

---


---

## 🔍 Problem Statement

### The Silent Struggle in Hill Tracts

The Chittagong Hill Tracts (Rangamati, Khagrachari, Bandarban) face critical healthcare challenges:

1. **Limited Internet Connectivity** 📡
   - Remote villages have sporadic or no internet access
   - Field volunteers cannot submit patient data in real-time
   - Traditional cloud-based systems fail in offline scenarios

2. **Difficult Terrain & Logistics** 🚤⛰️
   - Mountainous regions require multi-modal transport (road → boat → hiking)
   - Medical supply delivery is complex and time-consuming
   - Emergency response requires optimized route planning

3. **Epidemic Detection Delays** 🦠
   - Disease outbreaks (malaria, dengue) spread rapidly in clustered communities
   - Manual analysis cannot detect spatial patterns quickly
   - Delayed intervention leads to higher mortality rates

**The Result:** Healthcare workers struggle with data loss, delayed outbreak detection, and inefficient resource allocation, putting vulnerable hill tract populations at risk.

---

## 💡 Solution Overview

**HillTrack Pulse** is an intelligent healthcare monitoring system that tackles these challenges through three core innovations:

### 1. **Offline-First Data Collection** 💾
Field volunteers can submit patient records without internet using localStorage-based queue persistence. Data syncs automatically when connectivity returns.

### 2. **AI-Powered Epidemic Detection** 🤖
DBSCAN (Density-Based Spatial Clustering) algorithm analyzes geospatial patient data to identify disease clusters in real-time, enabling rapid outbreak response.

### 3. **Intelligent Logistics Optimization** 🗺️
Graph-based route visualization shows optimal medical supply paths through complex terrain (road → lake crossing → hill trek), with time and distance estimates.

---

## ✨ Key Features

### 🩺 **Volunteer Dashboard**
- **Offline Mode Toggle**: Enable data entry without internet connectivity
- **LocalStorage Queue**: Automatic persistence of offline submissions
- **Batch Sync**: Upload all queued records with visual progress bar
- **Toast Notifications**: Real-time feedback for all operations
- **Responsive Design**: Works on mobile devices in the field

### 👨‍💼 **Admin Dashboard**
- **Live Surveillance Map**: Real-time visualization of patient locations using Leaflet.js
- **AI Analysis Panel**: One-click DBSCAN clustering to detect epidemic hotspots
- **Critical Alerts**: Dynamic counter for high-risk clusters
- **Live Feed Sidebar**: Auto-refreshing stream of field reports (5-second polling)
- **4-State Dispatch Workflow**:
  1. **Normal**: Blue patient markers, run AI surveillance
  2. **Alert**: Red markers for detected clusters, generate supply route button
  3. **Logistics Modal**: Interactive route graph with travel time estimates
  4. **Success**: Dispatch confirmation with mobile notification

### 🧠 **AI Engine (DBSCAN Clustering)**
- **Algorithm**: Scikit-Learn DBSCAN (eps=0.005, min_samples=3)
- **Purpose**: Detect spatial disease clusters within ~500m radius
- **Output**: Marks patients as "Critical" when part of epidemic cluster
- **Real-time**: Updates map markers from blue → red on detection

### 📊 **Logistics Optimization**
- **Graph Visualization**: React Flow-based route network
- **Multi-Modal Transport**: Road (2.5km) → Boat (5.8km) → Hill Trek (3.2km)
- **Time Estimation**: Total 3h 20m travel time to critical zone
- **Step-by-Step Breakdown**: Color-coded transport modes with distances

### 🔄 **Data Sync Pipeline**
- **Volunteer → Backend**: POST `/api/sync` with offline queue
- **Backend → Admin**: GET `/api/recent-reports` (5-second polling)
- **Progress Tracking**: Visual 0-100% sync progress bar
- **Memory Storage**: Last 20 reports cached for live feed

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.11 (lightning-fast HMR)
- **Styling**: Tailwind CSS 3.4.17 (utility-first design)
- **Mapping**: Leaflet 1.9.4 + react-leaflet 4.2.1
- **Graphs**: React Flow 11.x (logistics visualization)
- **Charts**: Recharts 2.x (analytics)
- **Routing**: react-router-dom 7.11.0 (protected routes)
- **HTTP**: Axios 1.6.5

### **Backend**
- **Framework**: FastAPI 0.109.0 (Python 3.10+)
- **Server**: Uvicorn 0.27.0 (ASGI server)
- **AI/ML**: Scikit-learn 1.4.0 (DBSCAN clustering)
- **Data Processing**: NumPy, Pandas
- **Graph Algorithms**: NetworkX (future route optimization)

### **Development Tools**
- **Linting**: ESLint 9.15.0
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm
- **Version Control**: Git

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VOLUNTEER (Field Worker)                  │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │ Offline Mode   │────────▶│ LocalStorage     │           │
│  │ Data Entry     │         │ Queue (Persist)  │           │
│  └────────────────┘         └──────────────────┘           │
│          │                           │                       │
│          │ Internet Available        │                       │
│          ▼                           ▼                       │
│  ┌────────────────────────────────────────────┐             │
│  │  POST /api/sync (Batch Upload)             │             │
│  │  Progress Bar: 0% ────▶ 100%               │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌──────────────────────────────────────────────┐           │
│  │  Memory Storage: recent_reports[]            │           │
│  │  - Patient data with timestamps              │           │
│  │  - Last 20 records cached                    │           │
│  └──────────────────────────────────────────────┘           │
│          │                           │                       │
│          ▼                           ▼                       │
│  ┌──────────────┐           ┌──────────────────┐           │
│  │ POST /analyze│           │ GET /recent-     │           │
│  │ DBSCAN AI    │           │ reports (Polling)│           │
│  │ eps=0.005    │           │ Every 5 seconds  │           │
│  └──────────────┘           └──────────────────┘           │
│          │                           │                       │
│          ▼                           ▼                       │
│  ┌──────────────┐           ┌──────────────────┐           │
│  │ Cluster Data │           │ Live Report Feed │           │
│  │ Critical/    │           │ With Severity    │           │
│  │ Normal       │           │ Timestamps       │           │
│  └──────────────┘           └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ JSON Response
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Leaflet Map  │  │ AI Floating  │  │ Live Feed       │  │
│  │ Patient      │  │ Panel        │  │ Sidebar         │  │
│  │ Markers      │  │ Run/Analyze  │  │ Auto-refresh    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│          │                  │                               │
│          ▼                  ▼                               │
│  Blue Markers       Click "Generate Route"                  │
│  (Normal State)     ──────────────────▶                     │
│          │                  │                               │
│          ▼                  ▼                               │
│  Red Markers        ┌──────────────────────────┐           │
│  (Critical)         │ Logistics Modal          │           │
│                     │ React Flow Graph         │           │
│                     │ Road→Boat→Trek (11.5km)  │           │
│                     │ Est. Time: 3h 20m        │           │
│                     └──────────────────────────┘           │
│                              │                              │
│                              ▼                              │
│                     Click "DISPATCH MEDICAL TEAM"           │
│                              │                              │
│                              ▼                              │
│                     ✅ Success Banner                       │
│                     "Team Dispatched to Cluster"            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Tools Disclosure

**This project was developed using GitHub Copilot (Claude 3.5 Sonnet) for code generation, debugging, and architectural design.**

### Usage Details:
- **Code Generation**: React components, FastAPI endpoints, TypeScript interfaces
- **Algorithm Implementation**: DBSCAN clustering integration, graph visualization logic
- **Debugging Assistance**: Error resolution, type safety improvements, performance optimization
- **Documentation**: README structure, API documentation, code comments
- **UI/UX Design**: Tailwind CSS styling, responsive layouts, animation transitions

### Human Contributions:
- Problem analysis and solution architecture
- Domain-specific healthcare requirements
- Bangladesh Hill Tracts geographic context
- Testing and validation workflows
- Final integration and deployment decisions

**Compliance**: This disclosure satisfies Future Builders 2025 Hackathon requirements for AI tool transparency.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **Python**: 3.10+ with pip
- **Git**: Latest version
- **Internet**: For initial package installation

### Step 1: Clone Repository
```bash
git clone https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe.git
cd FutureBuilders2025_NSU_BUET_AIUB.exe
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn networkx

# Run the backend server
uvicorn main:app --reload

# Server will start at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

### Step 3: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Install additional required packages (if not in package.json)
npm install reactflow recharts

# Start the development server
npm run dev

# Application will open at: http://localhost:5173 (or 5174 if port is busy)
```

### Step 4: Verify Installation
1. Backend health check: Visit `http://localhost:8000/health`
   - Should return: `{"status": "healthy"}`
2. Frontend: Visit `http://localhost:5173`
   - Should show HillTrack Pulse login page

---

## 📖 Usage Guide

### 🩺 For Field Volunteers

1. **Login**
   - Navigate to the application
   - Enter any Volunteer ID and Location
   - Click "Login as Volunteer"

2. **Enable Offline Mode** (when in low connectivity area)
   - Toggle the "Limited Internet" switch to ON
   - Icon changes from WiFi to WifiOff

3. **Submit Patient Data**
   - Fill in patient name, age, symptoms, location
   - Click "Submit Entry"
   - Data is saved locally (visible in "Pending Sync" alert)

4. **Sync When Online**
   - Toggle offline mode OFF when internet is available
   - Click "Sync X Records" button
   - Watch progress bar fill from 0% to 100%
   - Success toast confirms upload

### 👨‍💼 For Administrators

1. **Login**
   - Username: `admin`
   - Password: `admin`
   - Click "Login as Admin"

2. **Monitor Live Map**
   - View blue markers for normal patient locations
   - Check "Active Volunteers", "Pending Syncs", "Critical Alerts" stats
   - Observe Live Feed sidebar for real-time field reports

3. **Run AI Surveillance**
   - Click purple "RUN AI SURVEILLANCE" button
   - Wait for DBSCAN analysis (~1-2 seconds)
   - Map markers turn RED if cluster detected
   - Critical Alerts counter updates

4. **Generate Supply Route**
   - Click orange "GENERATE SUPPLY ROUTE" button (appears after cluster detection)
   - Modal opens showing React Flow graph
   - Review route: Upazila Health Complex → Kaptai Lake → Jurachhari → Critical Zone
   - Note estimated time: 3h 20m

5. **Dispatch Medical Team**
   - Click green "DISPATCH MEDICAL TEAM" button in modal
   - Success banner appears at top
   - Confirmation: "Team Dispatched to Jurachhari Village A Cluster"

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /`
**Description**: Root health check  
**Response**:
```json
{
  "status": "HillTrack Pulse Online"
}
```

#### `GET /health`
**Description**: Backend health status  
**Response**:
```json
{
  "status": "healthy"
}
```

#### `POST /api/sync`
**Description**: Sync volunteer offline queue to backend  
**Request Body**:
```json
[
  {
    "patientName": "John Doe",
    "age": "34",
    "symptoms": "Fever, Headache",
    "location": "Rangamati",
    "diseaseType": "Suspected Malaria",
    "volunteerId": "Field Volunteer #753",
    "timestamp": "2025-12-28T10:30:00Z",
    "severity": "Moderate"
  }
]
```
**Response**:
```json
{
  "status": "success",
  "synced_count": 1,
  "message": "Successfully synced 1 records from field volunteer."
}
```

#### `GET /api/recent-reports`
**Description**: Fetch recent patient reports for live feed (polls every 5 seconds)  
**Response**:
```json
{
  "reports": [
    {
      "patient_name": "John Doe",
      "disease": "Suspected Malaria",
      "location": "Rangamati",
      "volunteer_id": "Field Volunteer #753",
      "timestamp": "2025-12-28T10:30:00Z",
      "severity": "Moderate"
    }
  ]
}
```

#### `POST /api/analyze`
**Description**: Run DBSCAN AI clustering on patient geospatial data  
**Response**:
```json
{
  "success": true,
  "cluster_detected": true,
  "message": "AI Analysis Complete. Epidemic Cluster Detected in Jurachhari Valley.",
  "data": [
    {
      "id": 1,
      "name": "Patient A",
      "lat": 22.6533,
      "lng": 92.1789,
      "status": "Critical",
      "cluster_id": 0
    }
  ]
}
```

---

## 📁 Project Structure

```
HillTrack-Pulse/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── ai_engine.py            # DBSCAN clustering logic
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HillMap.tsx           # Leaflet map component
│   │   │   ├── LogisticsGraph.tsx    # React Flow route visualization
│   │   │   └── LiveFeed.tsx          # Real-time report sidebar
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx         # Authentication UI
│   │   │   ├── AdminDashboard.tsx    # Admin control center
│   │   │   └── VolunteerDashboard.tsx # Field worker interface
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Authentication state management
│   │   ├── App.tsx               # Root component with routing
│   │   └── main.tsx              # Vite entry point
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite build configuration
│
└── README.md                     # This file
```

---

## 🔑 Demo Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin`
- **Features**: Full dashboard, AI surveillance, logistics dispatch

### Volunteer Access
- **ID**: Any alphanumeric (e.g., "VOL-001")
- **Location**: Any text (e.g., "Rangamati Village")
- **Features**: Offline data entry, sync functionality

---

## 🚀 Future Enhancements

### Phase 1: Database Integration
- [ ] PostgreSQL with PostGIS for geospatial queries
- [ ] Historical outbreak pattern analysis
- [ ] Multi-tenant support for different regions

### Phase 2: Advanced AI
- [ ] Prophet for time-series disease forecasting
- [ ] GraphSAGE for optimal supply route planning
- [ ] Computer vision for symptom detection via photos

### Phase 3: Mobile App
- [ ] React Native mobile application
- [ ] GPS-based automatic location tagging
- [ ] Push notifications for critical alerts

### Phase 4: Scale & Performance
- [ ] Redis caching for faster API responses
- [ ] WebSocket for real-time map updates
- [ ] Load balancing for multiple concurrent users

### Phase 5: Integration
- [ ] Government health ministry APIs
- [ ] SMS gateway for offline notifications
- [ ] Drone delivery route optimization

---

## 👥 Team & Acknowledgments

### Development Team
**Project**: HillTrack Pulse  
**Hackathon**: Future Builders 2025 (NSU, BUET, AIUB)  
**Focus Area**: Healthcare Technology for Hill Tracts  

### Special Thanks
- **GitHub Copilot** (Claude 3.5 Sonnet): AI-assisted development
- **Scikit-learn Community**: DBSCAN implementation
- **React & Vite Teams**: Modern frontend tooling
- **FastAPI Creators**: High-performance Python backend
- **Leaflet.js**: Open-source mapping library

### Inspiration
This project is dedicated to the healthcare workers serving the Chittagong Hill Tracts—from Rangamati's lake villages to Bandarban's mountain peaks. Your tireless efforts to reach every patient, regardless of terrain or connectivity, inspired this solution.

---

## 📄 License

This project is developed for the Future Builders 2025 Hackathon. All rights reserved by the development team.

---

## 📞 Contact & Support

For questions, feedback, or collaboration opportunities:
- **GitHub Repository**: [FutureBuilders2025_NSU_BUET_AIUB.exe](https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe)
- **Issue Tracker**: [GitHub Issues](https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe/issues)

---

<div align="center">

**Built with ❤️ for the Hill Tracts | Powered by AI | Driven by Impact**

🏔️ HillTrack Pulse - *Healthcare Where It Matters Most*

</div>
