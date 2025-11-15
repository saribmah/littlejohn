import { useNavigate } from 'react-router';
import { LandingPage } from '../features/landing';
import { useAuthStore } from '../features/auth';
import { useEffect } from 'react';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = () => {
    navigate('/signup');
  };

  return <LandingPage onSignUp={handleSignUp} />;
}
