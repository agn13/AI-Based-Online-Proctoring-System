import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-xl mt-4">Page not found</p>
      <Link className="mt-6 inline-block text-indigo-600 hover:underline" to="/login">
        Back to Login
      </Link>
    </div>
  );
}
