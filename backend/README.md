# AI Based Online Proctoring System - FastAPI Microservice

## Setup

1. python -m venv .venv
2. .\.venv\Scripts\activate
3. pip install -r requirements.txt

## Run

uvicorn proctoring_service.app:app --reload --host 0.0.0.0 --port 8000

## Endpoint

`POST /detect`

Request body:
```json
{ "image": "<base64>" }
```

Response body:
```json
{
  "violations": ["MULTIPLE_FACE", "PHONE"],
  "score": 20,
  "terminate": true
}
```
