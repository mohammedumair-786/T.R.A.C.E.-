from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OTPRequest(BaseModel):
    phone: str
    captcha_token: Optional[str] = None

class OTPVerify(BaseModel):
    phone: str
    otp: str

class CameraBase(BaseModel):
    name: str
    sector: str
    lat: float
    lng: float
    status: str
    is_simulated: bool

class CameraCreate(CameraBase):
    id: str

class CameraResponse(CameraCreate):
    class Config:
        orm_mode = True

class FrameProcess(BaseModel):
    camera_id: str
    frame_b64: str

class DetectionResponse(BaseModel):
    id: int
    camera_id: str
    plate: str
    timestamp: datetime
    confidence: float
    speed: Optional[float]
    
    class Config:
        orm_mode = True

class AlertResponse(BaseModel):
    id: int
    severity: str
    type: str
    title: str
    camera_id: str
    timestamp: datetime
    status: str
    
    class Config:
        orm_mode = True

class TrajectoryResponse(BaseModel):
    plate: str
    route_correlated_pct: float
    detections: List[DetectionResponse]
    path: List[dict] # {lat, lng}

class AnalyticsHourly(BaseModel):
    hour: str
    count: int
