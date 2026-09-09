import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../components/authContext';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <div>Loading…</div>;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}