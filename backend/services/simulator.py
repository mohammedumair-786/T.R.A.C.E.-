import asyncio
import random
from sqlalchemy.orm import Session
from models import Camera, Detection, Vehicle
from database import SessionLocal
import datetime

async def run_simulator(broadcast_callback):
    """
    Background task to generate synthetic detections for the 23 mock cameras.
    """
    print("Simulator started.")
    while True:
        await asyncio.sleep(random.uniform(5.0, 15.0)) # Fire every 5-15 seconds
        
        db = SessionLocal()
        try:
            # Get simulated cameras
            simulated_cams = db.query(Camera).filter(Camera.is_simulated == True).all()
            if not simulated_cams:
                db.close()
                continue
                
            cam = random.choice(simulated_cams)
            
            # Get a random vehicle
            vehicles = db.query(Vehicle).all()
            plate = random.choice(vehicles).plate if vehicles else f"UNKNOWN{random.randint(1000,9999)}"
            
            detection = Detection(
                camera_id=cam.id,
                plate=plate,
                confidence=random.uniform(0.85, 0.99),
                speed=random.uniform(30.0, 80.0)
            )
            db.add(detection)
            db.commit()
            db.refresh(detection)
            
            # Broadcast the new detection
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
            await broadcast_callback(event)
            
        except Exception as e:
            print("Simulator error:", e)
        finally:
            db.close()
