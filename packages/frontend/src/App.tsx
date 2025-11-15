import { useState } from 'react';
import { Dashboard } from './features/dashboard';
import { LoginForm, SignUpForm } from './features/auth';
import { LandingPage } from './features/landing';

type View = 'landing' | 'login' | 'signup' | 'dashboard';

function App() {
  const [isAuthenticated] = useState(false);
  const [view, setView] = useState<View>('landing');

  // Show landing page first
  if (view === 'landing') {
    return <LandingPage onSignUp={() => setView('signup')} />;
  }

  // Show auth forms
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {view === 'signup' ? <SignUpForm /> : <LoginForm />}
          <p className="text-center mt-4 text-sm text-gray-600">
            {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setView(view === 'signup' ? 'login' : 'signup')}
              className="text-blue-600 hover:underline"
            >
              {view === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
          <p className="text-center mt-2">
            <button
              onClick={() => setView('landing')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to home
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Little John</h1>
            <div className="flex gap-4">
              <a href="#" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Portfolio</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Agent</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Brokers</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
