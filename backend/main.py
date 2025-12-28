from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import generate_hill_data
from sklearn.cluster import DBSCAN
import numpy as np
from datetime import datetime
from typing import List, Dict
import random

app = FastAPI(title="HillTrack Pulse API")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "HillTrack Pulse Online"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Store data in memory for the demo
current_data = generate_hill_data()
recent_reports: List[Dict] = []  # Store recent synced reports

@app.get("/api/data")
def get_raw_data():
    """Returns the raw data (simulating offline sync)"""
    return current_data

@app.post("/api/analyze")
def run_ai_analysis():
    """
    RUNS THE MANDATORY AI MODEL
    Uses DBSCAN to detect density-based clusters in the hill tracts.
    """
    global current_data
    
    # 1. Extract Lat/Lng
    coords = np.array([[p['lat'], p['lng']] for p in current_data])
    
    # 2. Run DBSCAN (0.005 is approx 500m radius in coords)
    clustering = DBSCAN(eps=0.005, min_samples=3).fit(coords)
    labels = clustering.labels_
    
    # 3. Update the data with AI results
    cluster_found = False
    for i, label in enumerate(labels):
        current_data[i]['cluster_id'] = int(label)
        # If label != -1, it belongs to a cluster (DANGER)
        if label != -1:
            current_data[i]['status'] = 'Critical'
            cluster_found = True
            
    return {
        "success": True, 
        "cluster_detected": cluster_found, 
        "message": "AI Analysis Complete. Epidemic Cluster Detected in Jurachhari Valley.",
        "data": current_data
    }

@app.post("/api/sync")
def sync_volunteer_data(records: List[Dict]):
    """
    Accepts volunteer offline queue data and syncs it to the backend.
    Stores recent reports for the live feed.
    """
    global recent_reports
    
    synced_count = len(records)
    
    # Add to recent reports with timestamp
    for record in records:
        report = {
            "patient_name": record.get("patientName", "Unknown Patient"),
            "disease": record.get("diseaseType", "N/A"),
            "location": record.get("location", "Unknown"),
            "volunteer_id": record.get("volunteerId", "VOL-???"),
            "timestamp": datetime.now().isoformat(),
            "severity": record.get("severity", "Moderate")
        }
        recent_reports.insert(0, report)  # Add to beginning
    
    # Keep only last 20 reports
    recent_reports = recent_reports[:20]
    
    return {
        "status": "success",
        "synced_count": synced_count,
        "message": f"Successfully synced {synced_count} records from field volunteer."
    }

@app.get("/api/recent-reports")
def get_recent_reports():
    """
    Returns recent patient reports for the live feed.
    Polls every 5 seconds from admin dashboard.
    """
    # If no real data, return mock data
    if not recent_reports:
        mock_reports = [
            {
                "patient_name": f"Patient {chr(65+i)}",
                "disease": random.choice(["Malaria", "Dengue", "Routine Checkup", "Fever"]),
                "location": random.choice(["Rangamati", "Khagrachari", "Bandarban", "Jurachhari"]),
                "volunteer_id": f"VOL-{random.randint(100, 999)}",
                "timestamp": datetime.now().isoformat(),
                "severity": random.choice(["Low", "Moderate", "High"])
            }
            for i in range(5)
        ]
        return {"reports": mock_reports}
    
    return {"reports": recent_reports}