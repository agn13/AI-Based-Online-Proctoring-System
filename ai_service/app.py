from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/detect', methods=['POST'])
def detect_violations():
    """
    Endpoint to detect proctoring violations from video frames
    Expects: base64 encoded image or binary data
    Returns: JSON with detected violations
    """
    try:
        data = request.get_json()
        
        if not data or 'frame' not in data:
            return jsonify({"error": "No frame provided"}), 400
        
        # Decode base64 frame
        frame_data = base64.b64decode(data['frame'])
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # TODO: Implement actual violation detection logic
        # This is a placeholder
        violations = {
            "face_detected": True,
            "multiple_faces": False,
            "mobile_detected": False,
            "violence_detected": False,
            "confidence": 0.95
        }
        
        return jsonify({
            "success": True,
            "violations": violations
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze exam data for suspicious activity
    """
    try:
        data = request.get_json()
        
        # TODO: Implement analysis logic
        analysis = {
            "risk_level": "low",
            "flags": []
        }
        
        return jsonify({
            "success": True,
            "analysis": analysis
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
