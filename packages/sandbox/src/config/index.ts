/**
 * Application configuration
 */

export const config = {
  port: process.env.PORT || 3000,
  apiKey: process.env.ANTHROPIC_API_KEY,
} as const;
