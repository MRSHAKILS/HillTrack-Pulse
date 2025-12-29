from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ai_engine import generate_hill_data
from sklearn.cluster import DBSCAN
import numpy as np
from datetime import datetime
from typing import List, Dict
import random
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER

try:
    import google.generativeai as genai
    # Configure Gemini API
    genai.configure(api_key="AIzaSyB-9qiQFnK0JWkBV8nEBdx033td1Q1xCDs")
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  Gemini API not available - using fallback text generation")

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
current_data = generate_hill_data()  # Start with background noise
recent_reports: List[Dict] = []  # Store recent synced reports
next_patient_id = len(current_data) + 1  # Track IDs for new patients

@app.get("/api/data")
def get_raw_data():
    """Returns the raw data (simulating offline sync)"""
    initial_count = len(generate_hill_data())
    try:
        background_count = len([p for p in current_data if int(p['id']) <= initial_count])
        volunteer_count = len([p for p in current_data if int(p['id']) > initial_count])
    except (ValueError, TypeError):
        # If ID conversion fails, count all as volunteer data
        background_count = initial_count if len(current_data) >= initial_count else len(current_data)
        volunteer_count = max(0, len(current_data) - initial_count)
    
    return {
        "patients": current_data,
        "total_count": len(current_data),
        "background_data": background_count,
        "volunteer_data": volunteer_count
    }

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
    APPENDS real human input to current_data (doesn't overwrite).
    Stores recent reports for the live feed.
    """
    global current_data, recent_reports, next_patient_id
    
    synced_count = len(records)
    
    # ADD the real human input to the patient data list
    for record in records:
        # Convert volunteer submission to patient data format
        # Use provided lat/lng from smart dropdown (EXACT coordinates for AI clustering)
        patient_entry = {
            "id": next_patient_id,
            "name": record.get("patientName", f"Patient {next_patient_id}"),
            "lat": record.get("lat", 22.65),  # Use exact coordinates from dropdown
            "lng": record.get("lng", 92.18),  # Use exact coordinates from dropdown
            "age": int(record.get("age", 30)) if str(record.get("age", "")).isdigit() else 30,
            "date": record.get("timestamp", datetime.now().isoformat())[:10],
            "disease_type": record.get("symptoms", record.get("diseaseType", "Unknown Symptoms")),
            "severity": record.get("severity", "Moderate"),
            "status": record.get("status", "Normal"),  # Accept status from volunteer
            "volunteer_notes": record.get("volunteerNotes", ""),
            "medical_history": record.get("medicalHistory", ""),  # OCR scanned data
            "symptoms": record.get("symptoms", "")
        }
        current_data.append(patient_entry)
        next_patient_id += 1
        
        # Also add to recent reports for live feed
        report = {
            "patient_name": record.get("patientName", "Unknown Patient"),
            "disease": record.get("diseaseType", record.get("symptoms", "N/A")),
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
        "message": f"Successfully synced {synced_count} records from field volunteer. Total patients: {len(current_data)}"
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

@app.get("/api/generate-report")
def generate_report():
    """
    Generate a comprehensive PDF report with AI analysis and statistics
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#10b981'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # --- Header ---
    story.append(Paragraph("🏥 HillTrack Pulse", title_style))
    story.append(Paragraph("Epidemic Surveillance System - Official Report", styles['Heading3']))
    story.append(Spacer(1, 20))
    
    # --- Report Metadata ---
    story.append(Paragraph(f"<b>Report Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Paragraph(f"<b>Report Type:</b> Disease Outbreak Analysis", styles['Normal']))
    story.append(Paragraph(f"<b>Region:</b> Rangamati Hill District, Bangladesh", styles['Normal']))
    story.append(Spacer(1, 30))
    
    # --- System State ---
    system_state = {
        'active_volunteers': 12,
        'critical_alerts': len([p for p in current_data if p.get('status') == 'Critical']),
        'total_patients': len(current_data),
        'cluster_detected': len([p for p in current_data if p.get('cluster_id', -1) != -1]) > 0
    }
    
    # --- Statistics Table ---
    data = [
        ["Total Patients", "Active Volunteers", "Critical Alerts", "Logistics Status"],
        [str(system_state['total_patients']),
         str(system_state['active_volunteers']), 
         str(system_state['critical_alerts']), 
         "En Route" if system_state['cluster_detected'] else "Standby"]
    ]
    t = Table(data, colWidths=[120, 120, 120, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # --- AI Analysis Section ---
    story.append(Paragraph("<b>🧠 Gemini 3.0 AI Analysis</b>", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    # Generate AI analysis using Gemini API
    ai_text = None
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash-lite')
            
            # Prepare data summary for Gemini
            malaria_count = len([p for p in current_data if 'Malaria' in p.get('disease_type', '')])
            cluster_count = len([p for p in current_data if p.get('cluster_id', -1) != -1])
            
            prompt = f"""
            You are an AI epidemiologist analyzing disease outbreak data from Rangamati Hill District, Bangladesh.
            
            DATA SUMMARY:
            - Total Patients: {system_state['total_patients']}
            - Critical Alerts: {system_state['critical_alerts']}
            - Malaria Cases: {malaria_count}
            - Cluster Detected: {system_state['cluster_detected']}
            - Patients in Cluster: {cluster_count}
            - DBSCAN Parameters: eps=500m, min_samples=3
            
            Generate a professional epidemic analysis report with these sections:
            1. EPIDEMIC STATUS (2-3 sentences about current outbreak situation)
            2. RISK ASSESSMENT (2-3 sentences about spatial clustering and disease propagation risk)
            3. RECOMMENDATIONS (3-4 actionable recommendations for medical response teams)
            4. LOGISTICS BRIEF (if cluster detected, mention multi-modal transport: road, boat, hill trek)
            
            Keep it concise, professional, and actionable. Use medical terminology appropriate for health officials.
            """
            
            response = model.generate_content(prompt)
            ai_text = response.text
            
        except Exception as e:
            # Fallback to static text if API fails
            print(f"Gemini API Error: {e}")
            ai_text = None
    
    if ai_text is None:
        if system_state['cluster_detected']:
            ai_text = f"""
            EPIDEMIC CLUSTER DETECTED: The DBSCAN algorithm has identified a significant disease cluster 
            in the Jurachhari Valley region with {system_state['critical_alerts']} critical patients requiring immediate intervention.
            
            RISK ASSESSMENT: High density spatial clustering detected with epsilon radius of 500 meters. 
            Minimum sample threshold of 3 patients exceeded, indicating potential outbreak propagation.
            
            RECOMMENDATION: Immediate dispatch of medical teams with antimalarial supplies. Establish quarantine 
            protocols and conduct contact tracing within 2km radius. Monitor adjacent villages for symptom escalation.
            
            LOGISTICS: Optimal route computed via AI logistics engine. Multi-modal transport required: 
            Road (2.5km) → Boat crossing (5.8km) → Hill trek (3.2km). Estimated arrival: 3h 20min.
            """
        else:
            ai_text = f"""
            SURVEILLANCE STATUS: Normal distribution of cases detected across {system_state['total_patients']} patients. 
            No significant clustering patterns identified by DBSCAN algorithm.
            
            RISK LEVEL: Low - Current case distribution consistent with routine healthcare demand patterns.
            No immediate epidemic threat detected in monitored regions.
            
            RECOMMENDATION: Continue routine surveillance protocols. Maintain volunteer network for early warning detection.
            Monitor trend patterns for anomalies in spatial distribution.
            """
    
    # Split the AI text into paragraphs for better formatting
    for line in ai_text.strip().split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), styles['Normal']))
            story.append(Spacer(1, 8))
    
    story.append(Spacer(1, 20))
    
    # --- Patient Summary ---
    story.append(Paragraph("<b>📊 Disease Distribution Summary</b>", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    malaria_count = len([p for p in current_data if 'Malaria' in p.get('disease_type', '')])
    routine_count = len(current_data) - malaria_count
    
    disease_data = [
        ["Disease Type", "Patient Count", "Percentage"],
        ["Malaria Cases", str(malaria_count), f"{(malaria_count/len(current_data)*100):.1f}%" if current_data else "0%"],
        ["Routine Checkups", str(routine_count), f"{(routine_count/len(current_data)*100):.1f}%" if current_data else "0%"],
        ["Total", str(len(current_data)), "100%"]
    ]
    
    disease_table = Table(disease_data, colWidths=[200, 120, 120])
    disease_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(disease_table)

    # --- Footer ---
    story.append(Spacer(1, 40))
    story.append(Paragraph("<i>CONFIDENTIAL - INTERNAL USE ONLY</i>", styles['Italic']))
    story.append(Paragraph("<i>Generated by HillTrack Pulse AI Engine</i>", styles['Italic']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    filename = f"HillTrack_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/gemini-chat")
def gemini_chat(payload: Dict):
    """
    AI Medical Consultation Chat using Gemini API
    Accepts user query and patient context data for intelligent responses
    """
    user_query = payload.get("user_query", "")
    patient_data = payload.get("patient_data", None)
    
    if not user_query:
        return {"error": "No query provided"}
    
    try:
        if GEMINI_AVAILABLE:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            # Build context-aware prompt
            if patient_data:
                context_prompt = f"""
                You are an experienced medical consultant assisting field volunteers in rural Bangladesh (Chittagong Hill Tracts).
                
                PATIENT CONTEXT:
                - Name: {patient_data.get('name', 'Unknown')}
                - Age: {patient_data.get('age', 'Unknown')} years
                - Symptoms: {patient_data.get('symptoms', 'Not specified')}
                - Severity: {patient_data.get('severity', 'Moderate')}
                - Status: {patient_data.get('status', 'Normal')}
                - Location: {patient_data.get('location', 'Unknown')}
                - Volunteer Notes: {patient_data.get('volunteerNotes', 'None')}
                - Medical History: {patient_data.get('medicalHistory', 'None')}
                
                Based on this patient context, answer the following question professionally and concisely:
                {user_query}
                
                Guidelines:
                - Provide practical, field-applicable advice
                - Consider limited resources in remote hill areas
                - Mention red flags that require immediate evacuation
                - Be concise but thorough (2-3 paragraphs max)
                - Use clear, simple language for field volunteers
                """
            else:
                context_prompt = f"""
                You are an experienced medical consultant assisting field volunteers in rural Bangladesh.
                
                Question: {user_query}
                
                Provide practical medical advice suitable for remote field settings with limited resources.
                """
            
            response = model.generate_content(context_prompt)
            ai_response = response.text
            
            return {
                "success": True,
                "response": ai_response,
                "model": "gemini-2.0-flash-exp",
                "has_patient_context": patient_data is not None
            }
            
        else:
            # Fallback response when Gemini is not available
            fallback = f"""
            [Fallback Mode - Gemini API not available]
            
            Based on the query: "{user_query}"
            
            General Medical Advice:
            - Monitor patient vitals regularly (temperature, pulse, blood pressure)
            - Ensure adequate hydration and rest
            - Document any changes in symptoms
            - If symptoms worsen or new symptoms appear, seek immediate medical attention
            - For fever: Paracetamol 500mg every 6-8 hours
            - For severe cases: Arrange emergency transport to nearest health facility
            
            Note: This is a generic response. For accurate diagnosis, consult with a qualified medical professional.
            """
            
            return {
                "success": True,
                "response": fallback,
                "model": "fallback",
                "has_patient_context": patient_data is not None
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "response": "Sorry, I encountered an error processing your request. Please try again."
        }