import cv2
import numpy as np
from typing import Dict, List, Any, Tuple

def point_in_polygon(point: Tuple[float, float], polygon: List[List[int]]) -> bool:
    pts = np.array(polygon, dtype=np.int32)
    return cv2.pointPolygonTest(pts, point, False) >= 0

def polygon_intersection_ratio(bbox: List[int], polygon: List[List[int]]) -> float:
    x1, y1, x2, y2 = bbox
    bbox_poly = np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.int32)
    slot_poly = np.array(polygon, dtype=np.int32)
    
    slot_area = cv2.contourArea(slot_poly)
    if slot_area <= 0:
        return 0.0
        
    mask_slot = np.zeros((max(y2, np.max(slot_poly[:, 1])) + 10, max(x2, np.max(slot_poly[:, 0])) + 10), dtype=np.uint8)
    mask_bbox = np.zeros_like(mask_slot)
    
    cv2.fillPoly(mask_slot, [slot_poly], 255)
    cv2.fillPoly(mask_bbox, [bbox_poly], 255)
    
    intersection = cv2.bitwise_and(mask_slot, mask_bbox)
    intersection_area = np.count_nonzero(intersection)
    
    return float(intersection_area) / float(slot_area)

class OccupancyEvaluator:
    def __init__(self, ioa_threshold: float = 0.22):
        self.ioa_threshold = ioa_threshold

    def evaluate(
        self,
        slots: Dict[str, List[List[int]]],
        detections: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        slot_status = {}
        slot_details = {}
        
        for slot_id, poly in slots.items():
            is_occupied = False
            best_conf = 0.0
            best_ioa = 0.0
            matched_vehicle = None
            
            for det in detections:
                bbox = det["bbox"]
                cx = (bbox[0] + bbox[2]) / 2.0
                cy = (bbox[1] + bbox[3]) / 2.0
                
                ioa = polygon_intersection_ratio(bbox, poly)
                centroid_inside = point_in_polygon((cx, cy), poly)
                
                if ioa >= self.ioa_threshold or centroid_inside:
                    is_occupied = True
                    if ioa > best_ioa:
                        best_ioa = ioa
                        best_conf = det.get("confidence", 0.9)
                        matched_vehicle = det.get("class_name", "car")
            
            status = "OCCUPIED" if is_occupied else "AVAILABLE"
            slot_status[slot_id] = status
            slot_details[slot_id] = {
                "status": status,
                "confidence": round(best_conf, 2) if is_occupied else 1.0,
                "overlap_ratio": round(best_ioa, 3),
                "vehicle_type": matched_vehicle
            }
            
        total_slots = len(slots)
        occupied_count = sum(1 for st in slot_status.values() if st == "OCCUPIED")
        available_count = total_slots - occupied_count
        occupancy_pct = round((occupied_count / total_slots * 100.0), 1) if total_slots > 0 else 0.0
        
        return {
            "total_slots": total_slots,
            "occupied_slots": occupied_count,
            "available_slots": available_count,
            "occupancy_percentage": occupancy_pct,
            "slot_status": slot_status,
            "slot_details": slot_details,
            "total_vehicles_detected": len(detections)
        }
