import { Link, useNavigate } from 'react-router';
import { LoginForm } from '../features/auth';
import { ArrowLeft } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with back button */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Form Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
