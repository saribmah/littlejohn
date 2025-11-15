/**
 * Application configuration
 */

export const config = {
  port: process.env.PORT || 3001, // Sandbox runs on 3001, backend on 3000
  apiKey: process.env.ANTHROPIC_API_KEY,
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
} as const;
