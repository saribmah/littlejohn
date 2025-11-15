import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../features/auth';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
