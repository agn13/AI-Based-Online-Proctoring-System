# Architecture Explanation

## System Overview
The AI-Based Online Proctoring System is built using a microservices architecture that separates concerns into distinct, independently deployable services. This design ensures scalability, maintainability, and fault isolation.

## Component Breakdown

### 1. Frontend Service (React)
**Technology:** React.js with Tailwind CSS
**Port:** 3000
**Responsibilities:**
- User interface for login, exam taking, and admin panel
- Webcam capture and frame transmission
- Real-time violation alerts display
- Exam timer and submission handling

**Key Flows:**
- User authentication through login/register forms
- Continuous frame capture during exams (every 1-2 seconds)
- Display of exam questions and answer collection
- Real-time updates of violation warnings

### 2. Backend Service (Spring Boot)
**Technology:** Java Spring Boot
**Port:** 8080
**Responsibilities:**
- User authentication and authorization
- Exam management (CRUD operations)
- API orchestration between frontend and AI service
- Data persistence and retrieval
- Security and session management

**Key Flows:**
- JWT token generation and validation
- Exam creation and scheduling
- Frame forwarding to AI service
- Violation logging and scoring aggregation
- Results compilation and reporting

### 3. AI Service (Python)
**Technology:** Python with OpenCV and ML frameworks
**Port:** 5000
**Responsibilities:**
- Real-time image processing and analysis
- Face detection and recognition
- Eye tracking and gaze detection
- Object detection for suspicious items
- Violation scoring algorithm

**Key Flows:**
- Receive base64 encoded images from backend
- Process images using computer vision algorithms
- Detect multiple faces, closed eyes, unusual movements
- Calculate violation scores based on severity and frequency
- Return structured violation data

### 4. Database (PostgreSQL)
**Technology:** PostgreSQL
**Responsibilities:**
- User account storage
- Exam data and questions
- Violation logs and scores
- Exam results and analytics

## Data Flow During Proctoring

1. **Frame Capture:**
   - React frontend captures webcam frame
   - Converts to base64 string
   - Sends to `/api/proctoring/frame` endpoint

2. **Backend Processing:**
   - Spring Boot receives frame with student ID
   - Validates authentication and exam session
   - Forwards frame to AI service

3. **AI Analysis:**
   - Python service decodes base64 image
   - Applies computer vision algorithms:
     - Face detection using Haar cascades or DNN
     - Eye state analysis
     - Object detection for phones, books, etc.
   - Calculates violation score based on:
     - Type of violation (multiple faces = high score)
     - Duration of violation
     - Frequency of occurrences

4. **Response and Storage:**
   - AI service returns violation array and score
   - Backend stores violation in database
   - If score exceeds threshold, sends alert to frontend
   - Cumulative score tracked throughout exam

5. **Alert System:**
   - Frontend displays warnings for minor violations
   - Severe violations can trigger exam termination
   - Admin panel shows real-time monitoring

## Violation Scoring Engine

The scoring system is the core innovation of this platform:

- **Multiple Faces (Score: 10)**: Indicates potential cheating with another person
- **Eye Closed (Score: 3)**: May indicate sleeping or distraction
- **No Face Detected (Score: 5)**: Student may have left the frame
- **Suspicious Object (Score: 8)**: Detection of phones, books, or other aids
- **Unusual Movement (Score: 4)**: Rapid head movements or position changes

**Scoring Logic:**
- Scores accumulate over time
- Thresholds: Warning at 15, Termination at 30
- Time-based decay: Scores reduce over time if no new violations
- Weighted by exam importance and student history

## Security Considerations

- JWT tokens for session management
- Encrypted communication between services
- Image data sanitized before processing
- Role-based access control
- Audit logging for all proctoring events

## Scalability Features

- Stateless services allow horizontal scaling
- Database connection pooling
- Asynchronous processing for AI analysis
- CDN for static frontend assets
- Load balancing for backend services

## Deployment Architecture

```
Internet
    ↓
[Load Balancer]
    ↓
[React Frontend] ←→ [Spring Boot Backend] ←→ [Python AI Service]
                              ↓
                       [PostgreSQL Database]
```

This architecture ensures high availability, fault tolerance, and the ability to scale individual components based on load requirements.</content>
<parameter name="filePath">c:\Users\agnir\OneDrive\Desktop\Placement Oriented\AI-Based-Online-Proctoring-System\docs\architecture.md