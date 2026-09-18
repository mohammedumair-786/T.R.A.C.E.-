from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import asyncio
from typing import List

from database import engine, Base, get_db
from models import Officer, Camera, Vehicle, Detection, Alert, Violation, Challan, Blacklist
import schemas
from services.sms import send_otp, send_warning, send_challan
from services.anpr import anpr_engine
from services.simulator import run_simulator
from datetime import datetime, timedelta
import random

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="T.R.A.C.E. Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print("WS send error:", e)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # client might send pings, ignore
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_simulator(manager.broadcast))

# --- Auth Endpoints ---
# Mock OTP storage for hackathon
otp_store = {} 

@app.post("/api/auth/request-otp")
def request_otp(req: schemas.OTPRequest):
    # In reality, verify officer phone exists in DB
    otp = str(random.randint(100000, 999999))
    otp_store[req.phone] = otp
    send_otp(req.phone, otp)
    return {"message": "OTP sent successfully"}

@app.post("/api/auth/verify-otp")
def verify_otp(req: schemas.OTPVerify):
    if otp_store.get(req.phone) == req.otp:
        # Mock JWT
        token = "mock_jwt_token_123"
        return {"token": token, "user": {"phone": req.phone}}
    raise HTTPException(status_code=401, detail="Invalid OTP")

# --- Camera Endpoints ---
@app.get("/api/cameras", response_model=List[schemas.CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()

@app.post("/api/cameras/register", response_model=schemas.CameraResponse)
def register_camera(cam: schemas.CameraCreate, db: Session = Depends(get_db)):
    db_cam = Camera(**cam.dict())
    db.add(db_cam)
    db.commit()
    db.refresh(db_cam)
    return db_cam

# --- ANPR Endpoint ---
def check_violations(db: Session, detection: Detection):
    # Check Blacklist
    blacklist_entry = db.query(Blacklist).filter(Blacklist.plate == detection.plate).first()
    if blacklist_entry:
        return "Blacklisted Plate"
    
    # Check Speed limit (mock threshold 60)
    if detection.speed and detection.speed > 60:
        return "Speeding"
        
    return None

async def process_violation(db: Session, plate: str, reason: str, camera_id: str):
    # Find vehicle owner
    vehicle = db.query(Vehicle).filter(Vehicle.plate == plate).first()
    phone = vehicle.phone if vehicle else "+910000000000" # fallback
    
    # Check previous warnings in last 24h
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    past_warnings = db.query(Violation).filter(
        Violation.plate == plate,
        Violation.timestamp >= twenty_four_hours_ago
    ).count()
    
    # 1. Insert Violation
    violation = Violation(plate=plate, type=reason, camera_id=camera_id)
    db.add(violation)
    db.commit()
    
    count = past_warnings + 1
    
    if count == 1:
        # Send Warning
        send_warning(phone, plate, reason, camera_id, datetime.utcnow().strftime("%H:%M"), count)
        # Create Alert
        alert = Alert(severity="Warning", type="violation", title=f"Violation: {reason}", camera_id=camera_id)
        db.add(alert)
        db.commit()
        await manager.broadcast({"type": "new_alert", "data": {"id": alert.id, "title": alert.title}})
    else:
        # Send Challan
        fine = 1000.0 if reason == "Speeding" else 5000.0
        challan = Challan(plate=plate, reason=reason, fine_amount=fine, camera_id=camera_id)
        db.add(challan)
        db.commit()
        db.refresh(challan)
        
        send_challan(phone, plate, reason, fine, challan.id)
        
        # Create Critical Alert
        alert = Alert(severity="Critical", type="violation", title=f"Challan Issued: {plate}", camera_id=camera_id)
        db.add(alert)
        db.commit()
        await manager.broadcast({"type": "new_alert", "data": {"id": alert.id, "title": alert.title}})


@app.post("/api/anpr/process-frame")
async def process_frame(req: schemas.FrameProcess, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    result = anpr_engine.process_frame(req.frame_b64)
    plate = result.get("plate")
    conf = result.get("confidence", 0.0)
    persons = result.get("persons", [])
    
    import datetime
    timestamp_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Broadcast person detections
    for person in persons:
        person_event = {
            "type": "person_detection",
            "camera_id": req.camera_id,
            "class": "person",
            "confidence": round(person["confidence"], 3),
            "bbox": person["bbox"],
            "timestamp": timestamp_str
        }
        await manager.broadcast(person_event)
    
    if plate and conf >= 0.5: # Lowered threshold for hackathon demo ease
        # Calculate a mock speed for live demo
        speed = random.uniform(30.0, 75.0)
        
        detection = Detection(camera_id=req.camera_id, plate=plate, confidence=conf, speed=speed)
        db.add(detection)
        db.commit()
        db.refresh(detection)
        
        # Broadcast
        event = {
            "type": "new_detection",
            "data": {
                "id": detection.id,
                "camera_id": detection.camera_id,
                "plate": detection.plate,
                "timestamp": detection.timestamp.isoformat(),
                "confidence": detection.confidence,
                "speed": detection.speed
            }
        }
        await manager.broadcast(event)
        
        # Check Rules Engine
        violation_reason = check_violations(db, detection)
        if violation_reason:
            await process_violation(db, plate, violation_reason, req.camera_id)
            
        return {"status": "success", "plate": plate, "confidence": conf, "persons": len(persons), "objects": result.get("objects", [])}
        
    return {"status": "processed", "persons": len(persons), "objects": result.get("objects", [])}

# --- Trajectory Endpoints ---
@app.get("/api/trajectory/{plate}", response_model=schemas.TrajectoryResponse)
def get_trajectory(plate: str, db: Session = Depends(get_db)):
    detections = db.query(Detection).filter(Detection.plate == plate).order_by(Detection.timestamp).all()
    
    path = []
    for d in detections:
        cam = db.query(Camera).filter(Camera.id == d.camera_id).first()
        if cam:
            path.append({"lat": cam.lat, "lng": cam.lng, "timestamp": d.timestamp.isoformat()})
            
    # Mock route correlated %
    pct = min(100.0, len(detections) * 15.0)
    
    return {
        "plate": plate,
        "route_correlated_pct": pct,
        "detections": detections,
        "path": path
    }

@app.get("/api/vehicle/{plate}")
def get_vehicle(plate: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.plate == plate).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

# --- Analytics Endpoints ---
@app.get("/api/analytics/hourly-volume")
def get_hourly_volume(range: str = "today", db: Session = Depends(get_db)):
    # Mock data for dashboard
    return [
        {"hour": "08:00", "count": random.randint(100, 500)},
        {"hour": "09:00", "count": random.randint(500, 1500)},
        {"hour": "10:00", "count": random.randint(300, 800)},
    ]

@app.get("/api/analytics/heatmap")
def get_heatmap():
    # Mock heatmap data
    return {"Mon": [10, 20, 50, 90, 40], "Tue": [15, 25, 45, 85, 30]}

@app.get("/api/analytics/congestion-by-sector")
def get_congestion():
    return [
        {"sector": "Sector A", "density_pct": 85},
        {"sector": "Sector B", "density_pct": 40},
        {"sector": "Sector C", "density_pct": 12},
    ]

# --- Alerts Endpoints ---
@app.get("/api/alerts", response_model=List[schemas.AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).limit(50).all()

@app.post("/api/alerts/{id}/acknowledge")
def ack_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if alert:
        alert.status = "Acknowledged"
        db.commit()
    return {"status": "success"}

@app.post("/api/alerts/{id}/resolve")
def resolve_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if alert:
        alert.status = "Resolved"
        db.commit()
    return {"status": "success"}

@app.get("/api/challans")
def get_challans(db: Session = Depends(get_db)):
    return db.query(Challan).order_by(Challan.timestamp.desc()).all()

# --- Live Map Endpoints ---
@app.get("/api/map/cameras")
def map_cameras(db: Session = Depends(get_db)):
    cams = db.query(Camera).all()
    return [{"id": c.id, "lat": c.lat, "lng": c.lng, "status": c.status} for c in cams]

@app.get("/api/map/routes")
def map_routes():
    # Return mock colored segments for Leaflet
    return [
        {"segment_id": 1, "start_lat": 28.6139, "start_lng": 77.2090, "end_lat": 28.6200, "end_lng": 77.2100, "status": "congestion"},
        {"segment_id": 2, "start_lat": 28.6200, "start_lng": 77.2100, "end_lat": 28.6300, "end_lng": 77.2200, "status": "free flow"},
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
