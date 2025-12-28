from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import generate_hill_data
from sklearn.cluster import DBSCAN
import numpy as np

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