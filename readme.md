# 🏔️ HillTrack Pulse

**Real-Time Healthcare Monitoring System for Rangamati Hill District**

An intelligent healthcare platform for Bangladesh's Hill Tracts that works offline, detects disease outbreaks with AI, and optimizes medical supply routes.

## 🎥 Demo Video

[![Watch Demo](https://img.shields.io/badge/▶️_Watch_Demo_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/sAvS6U3bpzE)

**[🔗 Click here to watch the full demo](https://youtu.be/sAvS6U3bpzE)**

---

## 📋 Quick Links

- [Team](#-team-information)
- [Problem & Solution](#-problem--solution)
- [Features](#-key-features)
- [Technology](#-technology-stack)
- [Installation](#-installation--setup)
- [Usage](#-usage-guide)
- [API Docs](#-api-documentation)
- [Demo Credentials](#-demo-credentials)

---

## 👥 Team Information

**Team Name**: NSU_BUET_AIUB.exe

| Name | Institution | Email |
|------|-------------|-------|
| Shakil Ahmed | NSU | itshakilbd@gmail.com |
| Shahriar Ahmed Seam | BUET | shahriarseam17@gmail.com |
| Khaled Saifullah | AIUB | khaledsaifullah50956@gmail.com |

---

## 🔍 Problem & Solution

### The Challenge
Hill Tracts face critical healthcare issues:
- ❌ No internet in remote villages → data loss
- ❌ Difficult terrain (mountains + lakes) → slow delivery
- ❌ Disease outbreaks spread undetected → high mortality

### Our Solution
✅ **Offline-First**: Volunteers submit data without internet, syncs later  
✅ **AI Detection**: DBSCAN finds disease clusters automatically  
✅ **Smart Logistics**: Shows optimal route (road → boat → trek) with time estimates

---

## ✨ Key Features

### Volunteer Dashboard
- 📴 **Offline Mode**: Submit data without internet
- 💾 **Auto-Save**: Data stored in browser (LocalStorage)
- 🔄 **Batch Sync**: Upload all records when online
- 📱 **Mobile-Friendly**: Works on any device

### Admin Dashboard
- 🗺️ **Live Map**: See all patients on interactive map
- 🤖 **AI Analysis**: Detect disease clusters (DBSCAN)
- 🚨 **Real-Time Alerts**: Auto-updating critical counts
- 📊 **Live Feed**: Stream of field reports (auto-refresh)
- 📈 **Trend Charts**: 7-day disease outbreak analysis
- 🚚 **Logistics Graph**: Visual route optimization

### AI & Analytics
- **Algorithm**: DBSCAN clustering (500m radius, 3+ patients)
- **Detection**: Identifies epidemic hotspots automatically
- **Visualization**: Blue markers → Red clusters
- **Reports**: PDF generation with Gemini AI analysis

---

## 🛠️ Technology Stack

**Frontend**: React + TypeScript + Vite + Tailwind CSS  
**Mapping**: Leaflet.js  
**Graphs**: React Flow + Recharts  
**Backend**: FastAPI (Python)  
**AI/ML**: Scikit-learn (DBSCAN)  
**PDF**: ReportLab + Google Gemini API

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+

### Quick Start

**1. Clone Repository**
```bash
git clone https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe.git
cd FutureBuilders2025_NSU_BUET_AIUB.exe
```

**2. Backend Setup**
```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn reportlab google-generativeai
python -m uvicorn main:app --reload
# Server: http://localhost:8000
```

**3. Frontend Setup** (open new terminal)
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

**4. Access Application**
- Admin: http://localhost:5173 (login: admin/admin)
- Volunteer: Enter any ID and location

---

## 📖 Usage Guide

### For Volunteers
1. Login with a varified ID (e.g., "VOL-001")
2. Toggle "Limited Internet" ON for offline mode
3. Submit patient data → stored locally
4. Toggle OFF when online → Click "Sync" → Done!

### For Admins
1. Login: admin / admin
2. View live map (blue markers = normal patients)
3. Click "RUN AI" → Detects clusters → Red markers
4. Click "DISPATCH TEAM" → See route graph
5. Check "Total Cases" card for real-time count

---

## 📡 API Documentation

### Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Backend status |
| GET | `/api/data` | Get all patient data |
| POST | `/api/sync` | Sync volunteer offline queue |
| GET | `/api/recent-reports` | Live feed reports (auto-refresh) |
| POST | `/api/analyze` | Run DBSCAN AI clustering |
| GET | `/api/generate-report` | Download PDF report with AI analysis |

**Example: Sync Patient Data**
```bash
POST /api/sync
Content-Type: application/json

[{
  "patientName": "John Doe",
  "age": "34",
  "symptoms": "Fever, Headache",
  "location": "Rangamati",
  "lat": 22.6533,
  "lng": 92.1789,
  "volunteerId": "VOL-001"
}]
```

---

## 🔑 Demo Credentials

**Admin Login**  
Username: `admin`  
Password: `admin`

**Volunteer Login**  
ID: Any text (e.g., "VOL-001")  
Location: Any text (e.g., "Rangamati")

---

## 🤖 AI Tools Disclosure

This project used **GitHub Copilot (Claude 3.5 Sonnet)** for:
- Code generation & debugging
- UI/UX design with Tailwind CSS
- DBSCAN integration & graph visualization
- Documentation & API design

**Human contributions**: Problem analysis, healthcare domain expertise, Hill Tracts geographic context, testing workflows.

---

## 📞 Contact

**GitHub**: [FutureBuilders2025_NSU_BUET_AIUB.exe](https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe)  
**Issues**: [Report bugs here](https://github.com/MRSHAKILS/FutureBuilders2025_NSU_BUET_AIUB.exe/issues)

---

<div align="center">

**Built with ❤️ for Bangladesh Hill Tracts | Powered by AI | Driven by Impact**

🏔️ **HillTrack Pulse** - *Healthcare Where It Matters Most*

</div>
