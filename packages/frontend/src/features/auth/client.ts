import { createAuthClient } from 'better-auth/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

export type AuthClient = typeof authClient;
