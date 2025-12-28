import random
from datetime import datetime, timedelta

# RANGAMATI COORDINATES (The Hill Tracts Center)
CENTER_LAT = 22.6533
CENTER_LNG = 92.1789

def generate_hill_data():
    """
    Generates 50 patient records.
    - 35 are scattered (Normal noise).
    - 15 are TIGHTLY clustered in a 'Remote Valley' (The Outbreak).
    """
    patients = []
    
    # 1. Generate the "Outbreak Cluster" (e.g., Deep in Jurachhari Upazila)
    cluster_lat = CENTER_LAT + 0.02 # Slightly north
    cluster_lng = CENTER_LNG - 0.03 # Slightly west
    
    for i in range(15):
        patients.append({
            "id": f"P-{100+i}",
            "lat": cluster_lat + random.uniform(-0.002, 0.002), # Very tight cluster
            "lng": cluster_lng + random.uniform(-0.002, 0.002),
            "symptoms": "High Fever, Chills, Severe Headache", # Malaria symptoms
            "disease_type": "Suspected Malaria",
            "village": "Jurachhari Valley",
            "timestamp": datetime.now().isoformat(),
            "status": "Offline-Synced" # Shows the 'Limited Internet' feature
        })

    # 2. Generate Random Noise (Scattered across Rangamati)
    for i in range(35):
        patients.append({
            "id": f"P-{200+i}",
            "lat": CENTER_LAT + random.uniform(-0.1, 0.1),
            "lng": CENTER_LNG + random.uniform(-0.1, 0.1),
            "symptoms": random.choice(["Mild Cough", "Back Pain", "Gastric", "Skin Rash"]),
            "disease_type": "General",
            "village": "Random Hillside",
            "timestamp": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
            "status": "Online"
        })
        
    random.shuffle(patients)
    return patients