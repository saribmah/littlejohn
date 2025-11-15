/**
 * Application setup
 * Configures Hono app with routes and middleware
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleHealth, handleMessage } from './routes';

export function createApp() {
  const app = new Hono();

  // Enable CORS for all routes
  app.use('/*', cors());

  // Routes
  app.get('/', handleHealth);
  app.post('/message', handleMessage);

  return app;
}
