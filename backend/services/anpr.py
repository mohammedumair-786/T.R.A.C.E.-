import base64
import cv2
import numpy as np
import re

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: ultralytics not installed. ANPR will be mocked.")

class ANPRPipeline:
    def __init__(self):
        if YOLO_AVAILABLE:
            print("Loading YOLO11 model...")
            self.model = YOLO('yolo11n.pt') 
        else:
            self.model = None

    def validate_plate_format(self, text: str) -> str:
        text = re.sub(r'[^A-Z0-9]', '', text.upper())
        return text

    def process_frame(self, frame_b64: str):
        try:
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",")[1]
            img_data = base64.b64decode(frame_b64)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if not YOLO_AVAILABLE:
                return {"plate": None, "confidence": 0.0, "persons": [], "objects": []}

            results = self.model(img, verbose=False)
            
            objects = []
            persons_list = []

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    
                    if cls_id == 0:
                        obj_data = {
                            "class": "person",
                            "confidence": conf,
                            "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                        }
                        objects.append(obj_data)
                        persons_list.append(obj_data)
                        
            return {"plate": None, "confidence": 0.0, "persons": persons_list, "objects": objects}
            
        except Exception as e:
            print("ANPR processing error:", e)
            return {"plate": None, "confidence": 0.0, "persons": [], "objects": []}

anpr_engine = ANPRPipeline()
