import base64
import cv2
import numpy as np
from ultralytics import YOLO
import mediapipe as mp

mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose

# Load YOLO model once
yolo_model = YOLO('yolov8n.pt')

FACE_OBJ_NAMES = {'person'}
PHONE_OBJ_NAMES = {'cell phone', 'mobile phone'}

# for head pose estimation, 2D image points correspond to 3D model points
MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),  # nose tip
    (0.0, -330.0, -65.0),  # chin
    (-225.0, 170.0, -135.0),  # left eye left corner
    (225.0, 170.0, -135.0),  # right eye right corner
    (-150.0, -150.0, -125.0),  # left mouth corner
    (150.0, -150.0, -125.0)  # right mouth corner
], dtype=np.float64)


def from_base64(image_base64: str):
    img_bytes = base64.b64decode(image_base64)
    arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Invalid image data')
    return img


def detect_violations(image_b64: str):
    img = from_base64(image_b64)
    h, w = img.shape[:2]

    violations = set()

    # Face detection & landmarks
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detector:
        face_results = face_detector.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        if face_results.detections:
            face_count = len(face_results.detections)
            if face_count > 1:
                violations.add('MULTIPLE_FACE')
            elif face_count == 0:
                violations.add('NO_FACE')

    # Head pose + gaze with face mesh
    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=2, refine_landmarks=True, min_detection_confidence=0.5) as mesh:
        mesh_results = mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        if mesh_results.multi_face_landmarks:
            for landmarks in mesh_results.multi_face_landmarks:
                gaze_flag = _detect_gaze(landmarks, w, h)
                if gaze_flag:
                    violations.add('EYE_GAZE_AWAY')
                head_flag = _detect_head_pose(landmarks, w, h)
                if head_flag:
                    violations.add('HEAD_POSE_DEVIATION')

    # Object detection (YOLO)
    preds = yolo_model.predict(img, imgsz=640, conf=0.35, iou=0.45, device='cpu', verbose=False)
    for det in preds:
        for box in det.boxes:
            cls_idx = int(box.cls.cpu().numpy())
            name = yolo_model.names.get(cls_idx, '').lower()
            if name in PHONE_OBJ_NAMES:
                violations.add('PHONE')
            if name == 'person' and 'MULTIPLE_FACE' not in violations and len(face_results.detections or []) > 1:
                violations.add('MULTIPLE_FACE')

    # If no explicit violation, still return empty list
    return {
        'violations': sorted(violations),
        'score': _estimate_score(violations),
        'terminate': 'HEAD_POSE_DEVIATION' in violations or 'PHONE' in violations
    }


def _estimate_score(violations):
    base = 10
    if not violations:
        return 0
    return min(100, base * len(violations))


def _detect_gaze(face_landmarks, w, h):
    # rudimentary: compare eye center to nose direction
    left_eye_idx = 33
    right_eye_idx = 263
    nose_tip_idx = 1

    le = face_landmarks.landmark[left_eye_idx]
    re = face_landmarks.landmark[right_eye_idx]
    nose = face_landmarks.landmark[nose_tip_idx]

    eye_center_x = (le.x + re.x) / 2
    nose_x = nose.x
    diff = abs(eye_center_x - nose_x)
    return diff > 0.10


def _detect_head_pose(face_landmarks, w, h):
    try:
        image_points = np.array([
            (face_landmarks.landmark[1].x * w, face_landmarks.landmark[1].y * h),   # nose tip
            (face_landmarks.landmark[199].x * w, face_landmarks.landmark[199].y * h), # chin
            (face_landmarks.landmark[33].x * w, face_landmarks.landmark[33].y * h),   # left eye left
            (face_landmarks.landmark[263].x * w, face_landmarks.landmark[263].y * h), # right eye right
            (face_landmarks.landmark[61].x * w, face_landmarks.landmark[61].y * h),   # left mouth
            (face_landmarks.landmark[291].x * w, face_landmarks.landmark[291].y * h), # right mouth
        ], dtype=np.float64)

        camera_matrix = np.array([
            [w, 0, w / 2],
            [0, w, h / 2],
            [0, 0, 1]
        ], dtype=np.float64)
        dist_coeffs = np.zeros((4, 1))

        success, rotation_vector, translation_vector = cv2.solvePnP(MODEL_POINTS, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)
        if not success:
            return False

        rmat, _ = cv2.Rodrigues(rotation_vector)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)
        pitch, yaw, roll = angles
        return abs(pitch) > 30 or abs(yaw) > 30
    except Exception:
        return False
