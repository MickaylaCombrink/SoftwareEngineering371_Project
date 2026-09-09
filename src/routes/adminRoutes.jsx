import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../components/authContext';


export function AdminRoute() {
  const { status, isAdmin } = useAuth();

  if (status === 'loading') return <div>Loading…</div>;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}