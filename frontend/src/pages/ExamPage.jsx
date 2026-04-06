import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import {
  fetchExamDetails,
  submitExam,
  sendProctoringFrame,
  reportViolationEvent,
} from '../services/examService';
import Spinner from '../components/Spinner';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);

  const user = getCurrentUser();
  const studentId = user?.id || user?.studentId || 0;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [timer, setTimer] = useState(60 * 30); // 30min by default
  const THRESHOLD = 3;

  const addViolation = async (reason, type = 'GENERAL') => {
    if (studentId) {
      reportViolationEvent(studentId, type).catch((err) => console.warn('Violation API error', err));
    }

    setViolations((prev) => {
      const next = prev + 1;
      setWarnings((w) => [...w, `${new Date().toLocaleTimeString()} - ${reason}`]);
      if (next >= THRESHOLD) {
        autoSubmit();
      }
      return next;
    });
  };

  const autoSubmit = async () => {
    try {
      await submitExam(id, { status: 'auto-submitted', violations });
      alert('Threshold reached. Auto-submitting exam.');
      navigate('/student');
    } catch (err) {
      console.error(err);
      alert('Auto-submit failed.');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchExamDetails(id);
        setExam(res.data || { id, name: `Exam ${id}` });
        // if backend returns duration, set timer
        if (res.data?.durationMinutes) setTimer(res.data.durationMinutes * 60);
      } catch {
        setExam({ id, name: `Exam ${id}`, durationMinutes: 30 });
        setError('Could not load exam details from server');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (loading) return;

    const prepareCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        captureIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current || !studentId) return;
          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth || 320;
          canvasRef.current.height = videoRef.current.videoHeight || 240;
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

          const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.7).split(',')[1];

          try {
            const resp = await sendProctoringFrame(studentId, base64Image);
            const { violations: newViolations, terminate } = resp.data || {};

            if (Array.isArray(newViolations) && newViolations.length > 0) {
              newViolations.forEach((v) => {
                addViolation(`AI detected ${v}`, v);
              });
            }

            if (terminate) {
              addViolation('Server requested termination', 'TERMINATE');
            }
          } catch (err) {
            console.warn('Proctoring frame API error', err);
          }
        }, 3000);
      } catch (err) {
        setError('Camera access denied or not available.');
      }
    };

    prepareCamera();

    return () => {
      clearInterval(captureIntervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, [loading, id]);

  useEffect(() => {
    const tick = setInterval(() => {
      setTimer((round) => {
        if (round <= 1) {
          clearInterval(tick);
          autoSubmit();
          return 0;
        }
        return round - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        addViolation('Tab switched', 'TAB_SWITCH');
      }
    };

    const onBlur = () => addViolation('Window lost focus', 'WINDOW_BLUR');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const sanitizeEvent = (e) => {
    e.preventDefault();
    addViolation('Copy/paste/right-click attempt prevented', 'COPY_PASTE');
  };

  const handleSubmit = async () => {
    try {
      await submitExam(id, { status: 'finished', violations });
      navigate('/student');
    } catch (err) {
      console.error(err);
      setError('Could not submit exam.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <Spinner />;

  return (
    <div
      onContextMenu={sanitizeEvent}
      onCopy={sanitizeEvent}
      onCut={sanitizeEvent}
      onPaste={sanitizeEvent}
      className="space-y-5"
    >
      <h2 className="text-3xl font-semibold">{exam?.name || `Exam ${id}`}</h2>
      {error && <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Live Camera</h3>
          <div className="relative border border-slate-300 rounded overflow-hidden">
            <video ref={videoRef} className="w-full h-64 bg-black" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <p className="mt-2 text-sm text-slate-500">Camera frame captured every 3s and sent to backend.</p>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-lg font-semibold">Timer</p>
            <p className="text-4xl font-bold text-indigo-600">{formatTime(timer)}</p>
            <p className="mt-3">Violation Count: {violations}</p>
            <div className="mt-3 space-y-1">
              {warnings.slice(-4).map((w, idx) => (
                <div key={idx} className="text-xs bg-yellow-200 p-1 rounded">
                  {w}
                </div>
              ))}
            </div>
            {violations >= THRESHOLD ? (
              <div className="mt-3 text-red-700 font-semibold">Auto submit triggered due to too many violations.</div>
            ) : (
              <button onClick={handleSubmit} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
