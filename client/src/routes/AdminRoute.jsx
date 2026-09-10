import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

// Admin-only. A signed-in customer goes home, not to the login screen
export function AdminRoute() {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
