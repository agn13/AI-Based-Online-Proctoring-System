import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, saveAuthData } from '../services/authService';
import Spinner from '../components/Spinner';

const hardcodedUsers = [
  { username: 'student', password: 'student123', role: 'student', name: 'Student User' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        // Replace this with backend auth call where available
        const user = hardcodedUsers.find((u) => u.username === username && u.password === password && u.role === role);
        if (!user) throw new Error('Invalid credentials');
        res = { data: { token: btoa(`${username}:${password}:${role}:${Date.now()}`), user } };
      } else {
        // For register, add to hardcoded or assume success
        const newUser = { username, password, role, name };
        hardcodedUsers.push(newUser);
        res = { data: { token: btoa(`${username}:${password}:${role}:${Date.now()}`), user: newUser } };
      }

      saveAuthData({ token: res.data.token, user: res.data.user });

      if (role === 'student') navigate('/student');
      else navigate('/admin');

      // API call example (uncomment when backend ready):
      // const res = await (isLogin ? login(username, password, role) : register(username, password, role, name));

    } catch (e) {
      setError(e.message || `${isLogin ? 'Login' : 'Register'} failed`);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md bg-white shadow rounded p-6">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 rounded-l ${isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded-r ${!isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Register
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block font-medium">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border rounded p-2" required />
          </div>
        )}
        <div>
          <label className="block font-medium">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full border rounded p-2">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded p-2" required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700" disabled={loading}>
          {loading ? <Spinner /> : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
    </div>
  );
}
