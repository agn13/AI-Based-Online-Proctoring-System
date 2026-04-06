# AI-Based Online Proctoring System

## 🚀 Overview
The AI-Based Online Proctoring System is a comprehensive solution designed to ensure the integrity of online examinations through advanced AI-powered monitoring. It utilizes computer vision and machine learning to detect potential violations in real-time, providing a secure and fair testing environment for educational institutions.

## 🧠 Features
- **AI Monitoring**: Advanced face detection, eye tracking, and object recognition to monitor student behavior
- **Violation Scoring System**: Intelligent scoring algorithm that evaluates the severity of detected violations
- **Real-time Alerts**: Instant notifications for suspicious activities during exams
- **Secure Exam Environment**: Encrypted communication and secure data handling
- **Comprehensive Logging**: Detailed logs for audit and review purposes

## 🏗️ Architecture
The system follows a microservices architecture with the following data flow:

1. **Frontend (React)**: Captures webcam frames and sends them to the backend
2. **Backend (Spring Boot)**: Handles authentication, exam management, and orchestrates AI processing
3. **AI Service (Python)**: Processes images using computer vision models to detect violations
4. **Database (PostgreSQL)**: Stores exam data, user information, and violation logs

The flow works as follows:
- Student logs in through React frontend
- During exam, frontend continuously captures and sends frames to Spring Boot backend
- Backend forwards frames to Python AI service for analysis
- AI service returns violation detections and scores
- Backend stores results in PostgreSQL and sends alerts if necessary

## 🛠️ Tech Stack
### Frontend
- React.js
- Tailwind CSS
- Axios for API calls

### Backend
- Spring Boot (Java)
- Spring Security for authentication
- RESTful APIs

### AI Service
- Python
- OpenCV for computer vision
- TensorFlow/PyTorch for ML models

### Database
- PostgreSQL

## ⚙️ Setup Instructions

### Frontend Setup
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access at `http://localhost:3000`

### Backend Setup
1. Navigate to the `backend` directory
2. Ensure Java 11+ and Maven are installed
3. Run: `mvn spring-boot:run`
4. Server starts on `http://localhost:8080`

### AI Service Setup
1. Navigate to the `ai_service` directory
2. Install Python dependencies: `pip install -r requirements.txt`
3. Run the service: `python app.py`
4. Service runs on `http://localhost:5000`

### Database Setup
1. Install PostgreSQL
2. Create a database named `proctoring_db`
3. Update connection settings in backend configuration

## 🐳 Docker Setup
*Docker setup instructions will be added here*

## 📡 API Documentation
Detailed API documentation can be found in [docs/api-docs.md](api-docs.md) and [docs/api-contract.md](api-contract.md).

## 🎯 Unique Features
The system's standout feature is its **Violation Scoring Engine**, which goes beyond simple detection. It assigns weighted scores to different types of violations (multiple faces, eye movement, suspicious objects) and maintains a cumulative score throughout the exam. This allows for graduated responses - from warnings to exam termination - based on the severity and frequency of violations, providing a more nuanced and fair proctoring approach.

## 👨‍💻 Contributors
- [agn13](https://github.com/agn13) - Project Lead
- [Your Name] - Contributor</content>
<parameter name="filePath">c:\Users\agnir\OneDrive\Desktop\Placement Oriented\AI-Based-Online-Proctoring-System\docs\README.md