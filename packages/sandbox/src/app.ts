/**
 * Application setup
 * Configures Hono app with routes and middleware
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleHealth, handleMessage, handleInit, handleAnalyze } from './routes';

export function createApp() {
  const app = new Hono();

  // Enable CORS for all routes
  app.use('/*', cors());

  // Routes
  app.get('/', handleHealth);
  app.post('/init', handleInit);
  app.post('/analyze', handleAnalyze);
  app.post('/message', handleMessage);

  return app;
}
