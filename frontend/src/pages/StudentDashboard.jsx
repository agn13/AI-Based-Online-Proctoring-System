import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAvailableExams } from '../services/examService';
import Spinner from '../components/Spinner';

const fallbackExams = [
  { id: 1, name: 'Math 101', start: '2026-05-01 10:00', end: '2026-05-01 12:00' },
  { id: 2, name: 'English 201', start: '2026-05-02 14:00', end: '2026-05-02 16:00' },
];

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchAvailableExams();
        setExams(resp.data || fallbackExams);
      } catch (err) {
        console.warn('Failed to fetch exams, using fallback', err);
        setExams(fallbackExams);
        setError('Could not load exams from server; local fallback used.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold">Student Dashboard</h2>
      {error && <div className="text-yellow-700 bg-yellow-100 p-3 rounded">{error}</div>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold">{exam.name}</h3>
              <p>Start: {exam.start}</p>
              <p>End: {exam.end}</p>
              <Link
                to={`/exam/${exam.id}`}
                className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Start Exam
              </Link>
            </div>
          ))}
          {exams.length === 0 && <div className="text-slate-600">No exams available yet.</div>}
        </div>
      )}
    </div>
  );
}
