import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
import os

VEHICLE_CLASS_IDS = [2, 3, 5, 7]  # COCO: car, motorcycle, bus, truck
VEHICLE_NAMES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

class VehicleDetector:
    def __init__(self, model_name: str = "yolov8n.pt", conf_threshold: float = 0.25):
        self.conf_threshold = conf_threshold
        self.model_name = model_name
        self.model = None
        self.use_fallback = False
        
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
            print(f"[AI Detector] Successfully loaded YOLOv8 model: {model_name}")
        except Exception as e:
            print(f"[AI Detector] YOLOv8 could not be initialized ({e}). Using Computer Vision Fallback Engine.")
            self.use_fallback = True

    def detect(self, image: np.ndarray) -> List[Dict[str, Any]]:
        if self.model and not self.use_fallback:
            try:
                results = self.model(image, conf=self.conf_threshold, verbose=False)
                detections = []
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        
                        if cls_id in VEHICLE_CLASS_IDS or cls_id == 0:
                            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                            detections.append({
                                "bbox": [x1, y1, x2, y2],
                                "confidence": round(conf, 3),
                                "class_id": cls_id,
                                "class_name": VEHICLE_NAMES.get(cls_id, "car")
                            })
                return detections
            except Exception as e:
                print(f"[AI Detector] YOLO inference exception: {e}. Falling back to CV.")
                
        return self._detect_cv_contours(image)

    def _detect_cv_contours(self, image: np.ndarray) -> List[Dict[str, Any]]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        dilated = cv2.dilate(edges, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detections = []
        h, w = image.shape[:2]
        min_area = (w * h) * 0.015
        max_area = (w * h) * 0.25
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if min_area < area < max_area:
                x, y, bw, bh = cv2.boundingRect(cnt)
                aspect = bh / float(bw) if bw > 0 else 0
                if 0.5 <= aspect <= 2.5:
                    detections.append({
                        "bbox": [x, y, x + bw, y + bh],
                        "confidence": 0.88,
                        "class_id": 2,
                        "class_name": "car"
                    })
                    
        return detections
