import { Navigate, Outlet, Link } from 'react-router';
import { useAuthStore } from '../../features/auth';

export function DashboardLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-foreground">Little John</h1>
            <div className="flex gap-4 items-center">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <Link to="/portfolio" className="text-muted-foreground hover:text-foreground transition">
                Portfolio
              </Link>
              <Link to="/agent" className="text-muted-foreground hover:text-foreground transition">
                Agent
              </Link>
              <Link to="/brokers" className="text-muted-foreground hover:text-foreground transition">
                Brokers
              </Link>
              <div className="border-l border-border pl-4 ml-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
