from database import SessionLocal, engine, Base
from models import Camera, Vehicle, Blacklist
import uuid
import random

Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Camera).first():
        print("Database already seeded.")
        db.close()
        return

    # Seed 24 cameras
    base_lat = 28.6139
    base_lng = 77.2090
    for i in range(1, 25):
        cam_id = f"CAM-DEMO-{i:02d}"
        camera = Camera(
            id=cam_id,
            name=f"Traffic Node {i}",
            sector=f"Sector {chr(65 + (i % 5))}",
            lat=base_lat + random.uniform(-0.05, 0.05),
            lng=base_lng + random.uniform(-0.05, 0.05),
            status="online",
            is_simulated=(i != 1) # CAM-DEMO-01 is real
        )
        db.add(camera)
        
    # Seed mock RTO (Vehicles)
    mock_plates = ["DL8CX1234", "MH12AB5678", "KA01XY9876", "HR26DK4444", "UP16TZ1111"]
    for plate in mock_plates:
        v = Vehicle(
            plate=plate,
            owner_name=f"Owner of {plate}",
            phone="+919876543210", # use a safe dummy number or the user's if they want
            model="Sedan",
            color="White"
        )
        db.add(v)
        
    # Seed blacklist
    db.add(Blacklist(plate="MH12AB5678", reason="Stolen Vehicle"))
    
    db.commit()
    print("Database seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed_db()
