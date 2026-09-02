import os
import io
import time
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.detector import VehicleDetector
from services.occupancy import OccupancyEvaluator
from utils.slot_config import DEFAULT_NORMALIZED_SLOTS, get_pixel_slots
from utils.drawing import render_annotated_frame, encode_image_to_base64
from utils.generate_samples import create_sample_files

app = FastAPI(
    title="AI Smart Parking Vision API",
    description="YOLOv8 + OpenCV microservice for real-time parking slot occupancy detection.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = VehicleDetector(model_name="yolov8n.pt", conf_threshold=0.25)
evaluator = OccupancyEvaluator(ioa_threshold=0.20)

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
if not os.path.exists(os.path.join(SAMPLES_DIR, "sample_parking_1.jpg")):
    create_sample_files(SAMPLES_DIR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Smart Parking Vision API (FastAPI + YOLOv8)",
        "version": "1.0.0"
    }

@app.get("/status")
def get_status():
    return {
        "status": "ready",
        "model": detector.model_name,
        "mode": "computer_vision" if detector.use_fallback else "yolov8_neural_network",
        "confidence_threshold": detector.conf_threshold,
        "default_slots_count": len(DEFAULT_NORMALIZED_SLOTS)
    }

@app.get("/samples")
def list_samples():
    files = [f for f in os.listdir(SAMPLES_DIR) if f.endswith(('.jpg', '.png', '.jpeg', '.mp4'))]
    return {"samples": files}

@app.post("/detect")
async def detect_parking(
    file: UploadFile = File(None),
    sample_name: str = Form(None),
    confidence_threshold: float = Form(0.25),
    return_annotated_image: bool = Form(True)
):
    start_time = time.time()
    image = None
    
    if file:
        try:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
    elif sample_name:
        sample_path = os.path.join(SAMPLES_DIR, sample_name)
        if not os.path.exists(sample_path):
            sample_path = os.path.join(SAMPLES_DIR, "sample_parking_1.jpg")
        image = cv2.imread(sample_path)
    else:
        sample_path = os.path.join(SAMPLES_DIR, "sample_parking_1.jpg")
        image = cv2.imread(sample_path)
        
    if image is None:
        raise HTTPException(status_code=400, detail="Could not read or process image feed")
        
    h, w = image.shape[:2]
    slots = get_pixel_slots(DEFAULT_NORMALIZED_SLOTS, w, h)
    
    if confidence_threshold != detector.conf_threshold:
        detector.conf_threshold = confidence_threshold
        
    detections = detector.detect(image)
    analysis = evaluator.evaluate(slots, detections)
    
    inference_time_ms = round((time.time() - start_time) * 1000, 1)
    analysis["inference_time_ms"] = inference_time_ms
    analysis["image_dimensions"] = {"width": w, "height": h}
    analysis["detections"] = detections
    
    if return_annotated_image:
        annotated = render_annotated_frame(image, slots, analysis, detections)
        analysis["annotated_image"] = encode_image_to_base64(annotated)
        
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
