import random
from datetime import datetime, timedelta

# RANGAMATI COORDINATES (The Hill Tracts Center)
CENTER_LAT = 22.6533
CENTER_LNG = 92.1789

# Realistic Bangladeshi names for patient generation
FIRST_NAMES = ["Abdul", "Mohammad", "Kamal", "Rahim", "Salim", "Rashid", "Fatima", "Ayesha", 
               "Sultana", "Begum", "Jamal", "Noor", "Hasina", "Taslima", "Akhter", "Khatun",
               "Aziz", "Habib", "Nasir", "Razia", "Shirin", "Amina", "Khaleda", "Rokeya"]
LAST_NAMES = ["Ahmed", "Rahman", "Hossain", "Ali", "Khan", "Islam", "Begum", "Akter", 
              "Chowdhury", "Miah", "Sheikh", "Uddin", "Karim", "Bhuiyan", "Hussain"]

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
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "age": random.randint(5, 75),
            "lat": cluster_lat + random.uniform(-0.002, 0.002), # Very tight cluster
            "lng": cluster_lng + random.uniform(-0.002, 0.002),
            "symptoms": "High Fever, Chills, Severe Headache", # Malaria symptoms
            "disease_type": "Suspected Malaria",
            "severity": random.choice(["High", "Critical"]),
            "village": "Jurachhari Valley",
            "timestamp": datetime.now().isoformat(),
            "status": "Normal",
            "volunteer_notes": "Patient reported symptoms 2-3 days ago. Condition worsening."
        })

    # 2. Generate Random Noise (Scattered across Rangamati)
    for i in range(35):
        patients.append({
            "id": f"P-{200+i}",
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "age": random.randint(8, 80),
            "lat": CENTER_LAT + random.uniform(-0.1, 0.1),
            "lng": CENTER_LNG + random.uniform(-0.1, 0.1),
            "symptoms": random.choice(["Mild Cough", "Back Pain", "Gastric", "Skin Rash"]),
            "disease_type": "General",
            "severity": random.choice(["Low", "Moderate"]),
            "village": "Random Hillside",
            "timestamp": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
            "status": "Normal",
            "volunteer_notes": "Routine checkup. No severe symptoms."
        })
        
    random.shuffle(patients)
    return patients