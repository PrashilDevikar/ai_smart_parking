import os
import cv2
import numpy as np
from utils.slot_config import DEFAULT_NORMALIZED_SLOTS, get_pixel_slots

def draw_realistic_parking_lot(width=1280, height=720, occupied_slots=None):
    if occupied_slots is None:
        occupied_slots = ["A1", "A2", "A4", "A6", "A7"]
        
    img = np.full((height, width, 3), (48, 52, 58), dtype=np.uint8)
    noise = np.random.randint(-8, 8, (height, width, 3), dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    lane_y = int(height * 0.50)
    for x in range(30, width - 30, 80):
        cv2.line(img, (x, lane_y), (x + 40, lane_y), (200, 200, 200), 4)
        
    slots = get_pixel_slots(DEFAULT_NORMALIZED_SLOTS, width, height)
    
    for slot_id, pts in slots.items():
        polygon = np.array(pts, dtype=np.int32)
        cv2.polylines(img, [polygon], True, (230, 230, 230), 4, cv2.LINE_AA)
        
        M = cv2.moments(polygon)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            cv2.putText(img, slot_id, (cx - 15, cy - 20), cv2.FONT_HERSHEY_DUPLEX, 0.7, (180, 180, 180), 2, cv2.LINE_AA)

    car_colors = {
        "A1": (220, 220, 225),  # White
        "A2": (160, 40, 30),    # Blue SUV
        "A4": (30, 30, 190),    # Red
        "A6": (120, 120, 125),  # Silver
        "A7": (20, 20, 20),     # Black
        "A3": (50, 140, 40),    # Green
        "A5": (180, 100, 30),   # Navy
        "A8": (200, 180, 180)   # Light Gray
    }

    for slot_id in occupied_slots:
        if slot_id in slots:
            pts = np.array(slots[slot_id], dtype=np.int32)
            x_min, y_min = pts.min(axis=0)
            x_max, y_max = pts.max(axis=0)
            
            margin_x = int((x_max - x_min) * 0.12)
            margin_y = int((y_max - y_min) * 0.12)
            
            cx1 = x_min + margin_x
            cy1 = y_min + margin_y
            cx2 = x_max - margin_x
            cy2 = y_max - margin_y
            
            color = car_colors.get(slot_id, (150, 150, 150))
            
            shadow_mask = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.rectangle(shadow_mask, (cx1 + 8, cy1 + 8), (cx2 + 8, cy2 + 8), (15, 15, 15), -1)
            img = cv2.addWeighted(shadow_mask, 0.4, img, 1.0, 0)
            
            cv2.rectangle(img, (cx1, cy1), (cx2, cy2), color, -1)
            cv2.rectangle(img, (cx1, cy1), (cx2, cy2), (20, 20, 20), 2)
            
            car_w = cx2 - cx1
            car_h = cy2 - cy1
            front_glass_y1 = cy1 + int(car_h * 0.22)
            front_glass_y2 = cy1 + int(car_h * 0.38)
            cv2.rectangle(img, (cx1 + int(car_w * 0.15), front_glass_y1), (cx2 - int(car_w * 0.15), front_glass_y2), (40, 45, 50), -1)
            
            rear_glass_y1 = cy1 + int(car_h * 0.65)
            rear_glass_y2 = cy1 + int(car_h * 0.80)
            cv2.rectangle(img, (cx1 + int(car_w * 0.18), rear_glass_y1), (cx2 - int(car_w * 0.18), rear_glass_y2), (40, 45, 50), -1)
            
            cv2.rectangle(img, (cx1 + 4, cy1 + 2), (cx1 + 16, cy1 + 6), (240, 240, 255), -1)
            cv2.rectangle(img, (cx2 - 16, cy1 + 2), (cx2 - 4, cy1 + 6), (240, 240, 255), -1)
            cv2.rectangle(img, (cx1 + 4, cy2 - 6), (cx1 + 16, cy2 - 2), (0, 0, 220), -1)
            cv2.rectangle(img, (cx2 - 16, cy2 - 6), (cx2 - 4, cy2 - 2), (0, 0, 220), -1)

    return img

def create_sample_files(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    img1 = draw_realistic_parking_lot(1280, 720, ["A1", "A2", "A4", "A6", "A7"])
    cv2.imwrite(os.path.join(output_dir, "sample_parking_1.jpg"), img1)
    
    img2 = draw_realistic_parking_lot(1280, 720, ["A2", "A5"])
    cv2.imwrite(os.path.join(output_dir, "sample_parking_2.jpg"), img2)
    
    img3 = draw_realistic_parking_lot(1280, 720, ["A1", "A2", "A3", "A5", "A6", "A7", "A8"])
    cv2.imwrite(os.path.join(output_dir, "sample_parking_3.jpg"), img3)
    
    print(f"Generated sample parking images in {output_dir}")

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "samples")
    create_sample_files(out)
