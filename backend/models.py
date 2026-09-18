from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Officer(Base):
    __tablename__ = "officers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    badge_id = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    clearance_level = Column(String)
    jurisdiction = Column(String)

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(String, primary_key=True, index=True) # e.g., CAM-DEMO-01
    name = Column(String)
    sector = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String, default="online") # online/offline/flagged
    is_simulated = Column(Boolean, default=True)
    fps = Column(Integer, default=30)
    coverage_angle = Column(Integer, default=90)
    
    detections = relationship("Detection", back_populates="camera")
    alerts = relationship("Alert", back_populates="camera")

class Vehicle(Base):
    __tablename__ = "vehicles"
    plate = Column(String, primary_key=True, index=True)
    owner_name = Column(String)
    phone = Column(String)
    model = Column(String)
    color = Column(String)

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"))
    plate = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    confidence = Column(Float)
    speed = Column(Float, nullable=True)
    image_path = Column(String, nullable=True)
    
    camera = relationship("Camera", back_populates="detections")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String) # Critical/Warning/Info
    type = Column(String) # violation/obstacle
    title = Column(String)
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="New") # New/Acknowledged/Resolved
    
    camera = relationship("Camera", back_populates="alerts")

class Violation(Base):
    __tablename__ = "violations"
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, index=True)
    type = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    camera_id = Column(String, ForeignKey("cameras.id"))

class Challan(Base):
    __tablename__ = "challans"
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, index=True)
    reason = Column(String)
    fine_amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    camera_id = Column(String, ForeignKey("cameras.id"))
    evidence_path = Column(String, nullable=True)

class Blacklist(Base):
    __tablename__ = "blacklist"
    plate = Column(String, primary_key=True, index=True)
    reason = Column(String)
