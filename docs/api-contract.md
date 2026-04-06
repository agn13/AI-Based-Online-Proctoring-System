POST /api/proctoring/frame

Request:
{
  "studentId": 1,
  "image": "base64"
}

Response:
{
  "violations": ["MULTIPLE_FACE"],
  "score": 5,
  "terminate": false
}
