import { Navigate, Outlet, Link } from 'react-router';
import { useAuthStore } from '../../features/auth';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
        <p className="text-center mt-2">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
