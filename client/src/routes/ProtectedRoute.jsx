import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

// Requires a signed-in user; the server enforces this too
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
