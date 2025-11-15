import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { OnboardingFlow } from '../features/onboarding';
import { useAuthStore } from '../features/auth';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <OnboardingFlow />
      </div>
    </div>
  );
}
