import { Hono } from 'hono';
import { env } from '../../config/env';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
  });
});

health.get('/ready', (c) => {
  // Add readiness checks here (database, redis, etc.)
  const checks = {
    server: true,
    database: false, // TODO: implement DB check
    redis: false, // TODO: implement Redis check
  };

  const isReady = Object.values(checks).every(Boolean);
  const status = isReady ? 200 : 503;

  return c.json({
    ready: isReady,
    checks,
    timestamp: new Date().toISOString(),
  }, status);
});

export default health;
