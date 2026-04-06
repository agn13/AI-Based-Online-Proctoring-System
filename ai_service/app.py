from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ai_service.detector import detect_violations

app = FastAPI(title='Proctoring Detection Service', version='0.1.0')

class DetectRequest(BaseModel):
    image: str

class DetectResponse(BaseModel):
    violations: list[str]
    score: int
    terminate: bool

@app.post('/detect', response_model=DetectResponse)
async def detect(req: DetectRequest):
    if not req.image:
        raise HTTPException(status_code=400, detail='Image base64 data is required')

    try:
        result = detect_violations(req.image)
        return DetectResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Detection failed: {exc}')
