export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  NODE_ENV: import.meta.env.MODE || 'development',
} as const;
