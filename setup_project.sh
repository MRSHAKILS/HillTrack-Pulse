#!/bin/bash

# HillTrack Pulse - Project Setup Script
# Creates the monorepo structure for Backend (FastAPI) and Frontend (React Vite Tailwind)

echo "Setting up HillTrack Pulse project structure..."

# Create backend folder and files
echo "Creating backend folder..."
mkdir -p backend
cd backend

echo "Creating main.py..."
cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HillTrack Pulse API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to HillTrack Pulse API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
EOF

echo "Creating ai_engine.py..."
cat > ai_engine.py << 'EOF'
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

class AIEngine:
    def __init__(self):
        self.scaler = StandardScaler()
    
    def preprocess_data(self, data):
        """Preprocess input data for AI models"""
        # Placeholder for data preprocessing
        pass
    
    def predict(self, features):
        """Make predictions using trained models"""
        # Placeholder for prediction logic
        pass
    
    def analyze_trends(self, data):
        """Analyze trends in the data"""
        # Placeholder for trend analysis
        pass
EOF

echo "Creating requirements.txt..."
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn==0.27.0
pandas==2.2.0
numpy==1.26.3
scikit-learn==1.4.0
EOF

cd ..

# Create frontend folder
echo "Creating frontend folder..."
mkdir -p frontend

# Create root README.md
echo "Creating README.md..."
cat > README.md << 'EOF'
# HillTrack Pulse

A comprehensive monitoring and analytics platform built for the hackathon.

## Project Structure

```
HillTrack-Pulse/
├── backend/          # FastAPI Backend
│   ├── main.py
│   ├── ai_engine.py
│   └── requirements.txt
├── frontend/         # React + Vite + Tailwind Frontend
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Technology Stack

### Backend
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Scikit-learn

### Frontend
- React
- Vite
- Tailwind CSS

## Development

Backend runs on: http://localhost:8000
Frontend runs on: http://localhost:5173

## License

MIT
EOF

echo ""
echo "✓ Project structure created successfully!"
echo ""
echo "Structure:"
echo "  ├── backend/"
echo "  │   ├── main.py"
echo "  │   ├── ai_engine.py"
echo "  │   └── requirements.txt"
echo "  ├── frontend/"
echo "  └── README.md"
echo ""
echo "Next steps:"
echo "  1. Run this script: bash setup_project.sh"
echo "  2. Set up frontend with: cd frontend && npm create vite@latest . -- --template react"
echo "  3. Install frontend dependencies: cd frontend && npm install -D tailwindcss postcss autoprefixer"
echo ""
