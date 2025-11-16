export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  SANDBOX_URL: import.meta.env.VITE_SANDBOX_URL || 'http://localhost:3001',
  NODE_ENV: import.meta.env.MODE || 'development',
} as const;
