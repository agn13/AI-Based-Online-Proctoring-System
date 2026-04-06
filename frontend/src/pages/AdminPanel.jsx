import { useEffect, useState } from 'react';
import { createExam, fetchLogs, fetchResults } from '../services/examService';
import Spinner from '../components/Spinner';

export default function AdminPanel() {
  const [form, setForm] = useState({ name: '', start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [logsRes, resultsRes] = await Promise.all([fetchLogs(), fetchResults()]);
        setLogs(logsRes.data || []);
        setResults(resultsRes.data || []);
      } catch (err) {
        console.warn('Admin data load failed', err);
      }
    };
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await createExam(form);
      setMessage('Exam created successfully');
      setForm({ name: '', start: '', end: '' });
    } catch (err) {
      console.error(err);
      setMessage('Failed to create exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold">Admin Panel</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Create / Schedule Exam</h3>
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Exam Name"
              className="w-full border rounded p-2"
              required
            />
            <input
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
            <input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" disabled={loading}>
              {loading ? <Spinner /> : 'Create Exam'}
            </button>
          </form>
          {message && <p className="mt-2 text-green-700">{message}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <p>Log count: {logs.length}</p>
          <p>Results count: {results.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Results</h3>
          {results.length === 0 && <p className="text-slate-500">No results found.</p>}
          <ul className="space-y-2">
            {results.map((res) => (
              <li key={res.id} className="border p-2 rounded">
                {res.student} - {res.score}% - {res.status}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Logs</h3>
          {logs.length === 0 && <p className="text-slate-500">No logs found.</p>}
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className="border p-2 rounded">
                {log.message} - {log.date}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
