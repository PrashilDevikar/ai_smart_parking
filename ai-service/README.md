# AI Smart Parking - Computer Vision Service

This service uses **YOLOv8** and **OpenCV** to detect vehicles, analyze parking slot polygon boundaries, and determine real-time occupancy status.

## Installation & Setup

1. Create and activate a Python virtual environment:
`ash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate
`

2. Install dependencies:
`ash
pip install -r requirements.txt
`

3. Generate sample media images:
`ash
python utils/generate_samples.py
`

4. Run the FastAPI server:
`ash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
`

## Endpoints

- GET /: Health check
- GET /status: Model status and slot info
- GET /samples: List bundled demo parking scenes
- POST /detect: Upload image or specify sample name to get bounding boxes, slot statuses, and base64 annotated image.
