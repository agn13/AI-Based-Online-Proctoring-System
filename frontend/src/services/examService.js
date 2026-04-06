import api from './api';

export const fetchAvailableExams = () => api.get('/exams');
export const fetchExamDetails = (id) => api.get(`/exams/${id}`);
export const submitExam = (examId, payload) => api.post(`/exams/${examId}/submit`, payload);
export const createExam = (examBody) => api.post('/admin/exams', examBody);
export const fetchLogs = () => api.get('/admin/logs');
export const fetchResults = () => api.get('/admin/results');

export const sendProctoringFrame = (studentId, base64Image) =>
  api.post('/proctoring/frame', { studentId, image: base64Image });

export const reportViolationEvent = (studentId, type) =>
  api.post('/proctoring/violation', { studentId, type });
