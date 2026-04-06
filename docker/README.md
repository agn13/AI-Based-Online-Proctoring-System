# Docker Setup Guide

## Overview
This project uses Docker Compose to orchestrate multiple services:

- **Frontend**: React application running on nginx (port 3000)
- **Backend**: Spring Boot Java application (port 8080)
- **AI Service**: Python Flask service for violation detection (port 5000)
- **Database**: PostgreSQL database (port 5432)

All services communicate via Docker's internal network `proctoring-network`.

## Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 1.29+)

## Service Configuration

### 1. Frontend (React + Nginx)
- **Port**: 3000:80
- **Build**: Multi-stage Docker build
  - Build stage: Node.js 18 builds the React app
  - Production stage: Nginx serves the built app
- **Environment**: 
  - `REACT_APP_API_URL=http://localhost:8080` (for local development)
- **Features**:
  - React Router support via nginx config
  - API proxy to backend via `/api/` path

### 2. Backend (Spring Boot)
- **Port**: 8080:8080
- **Build**: Maven multi-stage build
  - Build stage: Compiles with dependencies
  - Production stage: JDK 17 runtime
- **Environment Variables**:
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/proctoring`
  - `SPRING_DATASOURCE_USERNAME=admin`
  - `SPRING_DATASOURCE_PASSWORD=password`
  - `AI_SERVICE_URL=http://ai-service:5000` (internal Docker network)
- **Dependencies**: 
  - Requires `db` service (PostgreSQL)
  - Requires `ai-service` service

### 3. AI Service (Python Flask)
- **Port**: 5000:5000
- **Runtime**: Python 3.10
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /detect` - Frame analysis for violation detection
  - `POST /analyze` - Exam data analysis
- **Framework**: Flask with CORS enabled

### 4. Database (PostgreSQL)
- **Port**: 5432:5432
- **Image**: postgres:15
- **Credentials**:
  - Database: `proctoring`
  - Username: `admin`
  - Password: `password`
- **Volume**: `postgres_data` for persistent storage
- **Auto-initialization**: Spring JPA creates tables on startup

## Running the System

### Start All Services
```bash
docker-compose up --build
```

This command will:
1. Build all Docker images
2. Create the Docker network
3. Create and start all containers
4. Display logs from all services

### Running in Background
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f db
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

Remove volumes:
```bash
docker-compose down -v
```

## Service URLs

Once running, access services at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:5000
- **Database**: localhost:5432

## Internal URLs (Container-to-Container)

Services communicate internally using DNS names (automatic via Docker):

- Backend → AI Service: `http://ai-service:5000`
- Any Service → Database: `jdbc:postgresql://db:5432/proctoring`
- Frontend → Backend (via nginx): Backend container name is `proctoring-backend`

## Troubleshooting

### Port Already in Use
If a port is already occupied:
```bash
# Change port mapping in docker-compose.yml
# Example: "8080:8080" → "8081:8080"
```

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check for errors: `docker-compose logs db`
- Verify credentials match in `docker-compose.yml` and Spring `application.properties`

### AI Service Connection Issues
- Verify service URL is `http://ai-service:5000` (not localhost)
- Check AI service logs: `docker-compose logs ai-service`
- Check Backend logs for connection errors: `docker-compose logs backend`

### Container Build Failures
```bash
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

### Database Persistence
If you need to reset the database:
```bash
docker-compose down -v
docker-compose up --build
```

## Environment Variables

Create a `.env` file to override defaults:

```env
# Frontend
REACT_APP_API_URL=http://localhost:8080

# Backend
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=password
AI_SERVICE_URL=http://ai-service:5000

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=proctoring
```

## Development Tips

1. **File Changes**: Changes to source files require rebuild
   ```bash
   docker-compose up --build
   ```

2. **Database Shell**: Access database directly
   ```bash
   docker-compose exec db psql -U admin -d proctoring
   ```

3. **Container Shell**: Debug running containers
   ```bash
   docker-compose exec backend bash
   docker-compose exec ai-service bash
   ```

4. **Network Inspection**: View container network
   ```bash
   docker network inspect <network-name>
   ```

## Important Configuration Notes

### ⚠️ CRITICAL: Use Container DNS Names in Code
**NOT**: `http://localhost:5000` (won't work in containers)
**USE**: `http://ai-service:5000` (Docker DNS resolution)

### ⚠️ Database URL Format
```
# Inside Docker
jdbc:postgresql://db:5432/proctoring

# From Host Machine
jdbc:postgresql://localhost:5432/proctoring
```

### Security Considerations
- Default credentials (admin/password) are for development only
- **Change credentials** before deploying to production
- Use `.env` file for sensitive data (add to `.gitignore`)
- Consider using Docker secrets for production

## Performance Optimization

For production deployments:

1. Multi-stage builds (already implemented) reduce image size
2. Use specific image tags (not `latest`)
3. Set resource limits in docker-compose.yml:
   ```yaml
   services:
     backend:
       deploy:
         limits:
           cpus: '0.5'
           memory: 1G
   ```

4. Use health checks:
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```
