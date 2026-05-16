import { Navigate, Outlet } from 'react-router-dom';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-shield-glow">Loading secure session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
