import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import EmployeesPage from './pages/EmployeesPage';
import ManagementPage from './pages/ManagementPage';
import EmployeePublicView from './pages/EmployeePublicView';
import ManagementItemPublicView from './pages/ManagementItemPublicView';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/:id/management.pcred.org/:slug" element={<ManagementItemPublicView />} />
      <Route path="/employee/:id" element={<EmployeePublicView />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeesPage />} />
        <Route path="management" element={<ManagementPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
