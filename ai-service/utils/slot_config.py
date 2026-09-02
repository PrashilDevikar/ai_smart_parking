import json
from typing import Dict, List, Any

# Normalized polygon coordinates (0.0 to 1.0) for standard camera angle view
# 2 rows of 4 slots: Left bay A1-A4, Right bay A5-A8
DEFAULT_NORMALIZED_SLOTS = {
    # Top/Left Row
    "A1": [[0.06, 0.22], [0.26, 0.22], [0.26, 0.44], [0.06, 0.44]],
    "A2": [[0.29, 0.22], [0.49, 0.22], [0.49, 0.44], [0.29, 0.44]],
    "A3": [[0.52, 0.22], [0.72, 0.22], [0.72, 0.44], [0.52, 0.44]],
    "A4": [[0.75, 0.22], [0.95, 0.22], [0.95, 0.44], [0.75, 0.44]],
    
    # Bottom/Right Row
    "A5": [[0.06, 0.56], [0.26, 0.56], [0.26, 0.78], [0.06, 0.78]],
    "A6": [[0.29, 0.56], [0.49, 0.56], [0.49, 0.78], [0.29, 0.78]],
    "A7": [[0.52, 0.56], [0.72, 0.56], [0.72, 0.78], [0.52, 0.78]],
    "A8": [[0.75, 0.56], [0.95, 0.56], [0.95, 0.78], [0.75, 0.78]],
}

# 12-slot perspective layout (angled parking lot view)
DEFAULT_PERSPECTIVE_SLOTS = {
    "A1": [[0.05, 0.20], [0.18, 0.20], [0.18, 0.48], [0.05, 0.48]],
    "A2": [[0.20, 0.20], [0.33, 0.20], [0.33, 0.48], [0.20, 0.48]],
    "A3": [[0.35, 0.20], [0.48, 0.20], [0.48, 0.48], [0.35, 0.48]],
    "A4": [[0.50, 0.20], [0.63, 0.20], [0.63, 0.48], [0.50, 0.48]],
    "A5": [[0.65, 0.20], [0.78, 0.20], [0.78, 0.48], [0.65, 0.48]],
    "A6": [[0.80, 0.20], [0.93, 0.20], [0.93, 0.48], [0.80, 0.48]],
    
    "A7": [[0.05, 0.55], [0.18, 0.55], [0.18, 0.83], [0.05, 0.83]],
    "A8": [[0.20, 0.55], [0.33, 0.55], [0.33, 0.83], [0.20, 0.83]],
    "B1": [[0.35, 0.55], [0.48, 0.55], [0.48, 0.83], [0.35, 0.83]],
    "B2": [[0.50, 0.55], [0.63, 0.55], [0.63, 0.83], [0.50, 0.83]],
    "B3": [[0.65, 0.55], [0.78, 0.55], [0.78, 0.83], [0.65, 0.83]],
    "B4": [[0.80, 0.55], [0.93, 0.55], [0.93, 0.83], [0.80, 0.83]],
}

def get_pixel_slots(slots_dict: Dict[str, List[List[float]]], width: int, height: int) -> Dict[str, List[List[int]]]:
    """Convert normalized [0.0 - 1.0] polygon coordinates to actual pixel values."""
    pixel_slots = {}
    for slot_id, points in slots_dict.items():
        pixel_points = []
        for pt in points:
            px = int(pt[0] * width)
            py = int(pt[1] * height)
            pixel_points.append([px, py])
        pixel_slots[slot_id] = pixel_points
    return pixel_slots

def get_default_slots(width: int, height: int, slot_set: str = "standard") -> Dict[str, List[List[int]]]:
    """Retrieve default pixel coordinates for standard parking templates."""
    if slot_set == "perspective":
        return get_pixel_slots(DEFAULT_PERSPECTIVE_SLOTS, width, height)
    return get_pixel_slots(DEFAULT_NORMALIZED_SLOTS, width, height)
