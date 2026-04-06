import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

export default function Layout({ children }) {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            AI Proctoring
          </Link>
          <div className="space-x-3">
            {user ? (
              <>
                <span className="hidden sm:inline">{user.name || user.username}</span>
                <button onClick={logout} className="bg-white text-indigo-600 hover:bg-slate-100 px-3 py-1 rounded">
                  Logout
                </button>
              </>
            ) : (
              <Link className="bg-white text-indigo-600 hover:bg-slate-100 px-3 py-1 rounded" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
