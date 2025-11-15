import { createAuthClient } from 'better-auth/client';
import { onboardingClient } from '@better-auth-extended/onboarding/client';
import { auth } from '../../../../backend/src/features/auth/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    onboardingClient<typeof auth>({
      onOnboardingRedirect: () => {
        // Redirect to onboarding page when user needs to complete onboarding
        window.location.href = '/onboarding';
      },
    }),
  ],
});

export type AuthClient = typeof authClient;
