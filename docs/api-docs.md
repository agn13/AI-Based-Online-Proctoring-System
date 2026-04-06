# API Documentation

This document provides detailed information about all available API endpoints for the AI-Based Online Proctoring System.

## Authentication Endpoints

### POST /api/auth/login
Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "student|admin"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "string",
    "role": "student|admin",
    "name": "string"
  }
}
```

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "student|admin",
  "name": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "string",
    "role": "student|admin",
    "name": "string"
  }
}
```

## Exam Management Endpoints

### GET /api/exams
Retrieve list of available exams for the current user.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Math Exam",
    "description": "Final mathematics examination",
    "duration": 120,
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T12:00:00Z"
  }
]
```

### GET /api/exams/{id}
Get detailed information about a specific exam.

**Response:**
```json
{
  "id": 1,
  "title": "Math Exam",
  "description": "Final mathematics examination",
  "duration": 120,
  "questions": [
    {
      "id": 1,
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ],
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z"
}
```

### POST /api/exams/{examId}/submit
Submit answers for a completed exam.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "answer": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Exam submitted successfully",
  "score": 85,
  "totalQuestions": 10
}
```

## Admin Endpoints

### POST /api/admin/exams
Create a new exam (Admin only).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "duration": 120,
  "questions": [
    {
      "question": "string",
      "options": ["string"],
      "correctAnswer": 0
    }
  ],
  "startTime": "ISO8601 datetime",
  "endTime": "ISO8601 datetime"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Exam created successfully"
}
```

### GET /api/admin/logs
Retrieve system logs (Admin only).

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2024-01-01T10:00:00Z",
    "level": "INFO|WARN|ERROR",
    "message": "Log message",
    "userId": 1
  }
]
```

### GET /api/admin/results
Get exam results for all students (Admin only).

**Response:**
```json
[
  {
    "examId": 1,
    "studentId": 1,
    "studentName": "John Doe",
    "score": 85,
    "submittedAt": "2024-01-01T12:00:00Z",
    "violations": 2
  }
]
```

## Proctoring Endpoints

### POST /api/proctoring/frame
Send a webcam frame for AI analysis.

**Request Body:**
```json
{
  "studentId": 1,
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "violations": ["MULTIPLE_FACE", "EYE_CLOSED"],
  "score": 5,
  "terminate": false
}
```

### POST /api/proctoring/violation
Report a manual violation event.

**Request Body:**
```json
{
  "studentId": 1,
  "type": "MANUAL_REPORT"
}
```

**Response:**
```json
{
  "message": "Violation reported",
  "currentScore": 8
}
```

## Error Responses
All endpoints may return the following error formats:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Validation error details"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```</content>
<parameter name="filePath">c:\Users\agnir\OneDrive\Desktop\Placement Oriented\AI-Based-Online-Proctoring-System\docs\api-docs.md