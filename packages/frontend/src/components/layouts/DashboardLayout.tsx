import { Navigate, Outlet, Link } from 'react-router';
import { useAuthStore } from '../../features/auth';

export function DashboardLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Little John</h1>
            <div className="flex gap-4 items-center">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/portfolio" className="text-gray-700 hover:text-gray-900">
                Portfolio
              </Link>
              <Link to="/agent" className="text-gray-700 hover:text-gray-900">
                Agent
              </Link>
              <Link to="/brokers" className="text-gray-700 hover:text-gray-900">
                Brokers
              </Link>
              <div className="border-l pl-4 ml-4 flex items-center gap-3">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
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
