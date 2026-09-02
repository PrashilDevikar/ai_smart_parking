import cv2
import base64
import numpy as np
from typing import Dict, List, Any

COLOR_AVAILABLE = (94, 197, 34)    # Green (BGR)
COLOR_OCCUPIED = (68, 68, 239)     # Red (BGR)
COLOR_RESERVED = (21, 204, 250)    # Yellow (BGR)
COLOR_BBOX = (255, 215, 0)         # Cyan / Gold
COLOR_TEXT = (255, 255, 255)
COLOR_HUD_BG = (20, 24, 33)

def draw_hud_header(image: np.ndarray, analysis: Dict[str, Any]) -> np.ndarray:
    h, w = image.shape[:2]
    overlay = image.copy()
    
    hud_h = max(50, int(h * 0.08))
    cv2.rectangle(overlay, (0, 0), (w, hud_h), COLOR_HUD_BG, -1)
    
    alpha = 0.85
    image = cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0)
    
    title = "AI SMART PARKING SYSTEM (YOLOv8)"
    stats = f"TOTAL: {analysis['total_slots']}  |  OCCUPIED: {analysis['occupied_slots']}  |  AVAILABLE: {analysis['available_slots']}  |  RATE: {analysis['occupancy_percentage']}%"
    
    font_scale = max(0.45, w / 1800.0)
    thickness = max(1, int(w / 800.0))
    
    cv2.putText(image, title, (20, int(hud_h * 0.45)), cv2.FONT_HERSHEY_DUPLEX, font_scale, (0, 220, 255), thickness, cv2.LINE_AA)
    cv2.putText(image, stats, (20, int(hud_h * 0.85)), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 0.85, (255, 255, 255), 1, cv2.LINE_AA)
    
    return image

def draw_parking_slots(image: np.ndarray, slots: Dict[str, List[List[int]]], slot_status: Dict[str, str]) -> np.ndarray:
    overlay = image.copy()
    
    for slot_id, polygon in slots.items():
        status = slot_status.get(slot_id, "AVAILABLE")
        if status == "OCCUPIED":
            color = COLOR_OCCUPIED
        elif status == "RESERVED":
            color = COLOR_RESERVED
        else:
            color = COLOR_AVAILABLE
            
        pts = np.array(polygon, dtype=np.int32)
        cv2.fillPoly(overlay, [pts], color)
        cv2.polylines(image, [pts], True, color, 2, cv2.LINE_AA)
        
        M = cv2.moments(pts)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            
            badge_text = f"{slot_id}: {status}"
            (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            
            cv2.rectangle(image, (cx - tw//2 - 4, cy - th//2 - 4), (cx + tw//2 + 4, cy + th//2 + 4), (15, 23, 42), -1)
            cv2.rectangle(image, (cx - tw//2 - 4, cy - th//2 - 4), (cx + tw//2 + 4, cy + th//2 + 4), color, 1)
            cv2.putText(image, badge_text, (cx - tw//2, cy + th//2 - 1), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT, 1, cv2.LINE_AA)

    alpha = 0.35
    return cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0)

def draw_vehicle_detections(image: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        conf = det.get("confidence", 0.0)
        cls_name = det.get("class_name", "vehicle")
        
        cv2.rectangle(image, (x1, y1), (x2, y2), COLOR_BBOX, 2, cv2.LINE_AA)
        
        label = f"{cls_name} {int(conf * 100)}%"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
        cv2.rectangle(image, (x1, max(0, y1 - 20)), (x1 + tw + 6, max(20, y1)), (15, 23, 42), -1)
        cv2.putText(image, label, (x1 + 3, max(14, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1, cv2.LINE_AA)
    return image

def render_annotated_frame(
    image: np.ndarray,
    slots: Dict[str, List[List[int]]],
    analysis: Dict[str, Any],
    detections: List[Dict[str, Any]]
) -> np.ndarray:
    rendered = image.copy()
    rendered = draw_parking_slots(rendered, slots, analysis.get("slot_status", {}))
    rendered = draw_vehicle_detections(rendered, detections)
    rendered = draw_hud_header(rendered, analysis)
    return rendered

def encode_image_to_base64(image: np.ndarray, quality: int = 85) -> str:
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    success, buffer = cv2.imencode(".jpg", image, encode_params)
    if not success:
        raise ValueError("Failed to encode image")
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"
