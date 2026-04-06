import { Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './services/authService';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ExamPage from './pages/ExamPage';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function Protected({ children, role }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student"
          element={
            <Protected role="student">
              <StudentDashboard />
            </Protected>
          }
        />
        <Route
          path="/exam/:id"
          element={
            <Protected role="student">
              <ExamPage />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected role="admin">
              <AdminPanel />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
