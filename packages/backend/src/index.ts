import { Hono } from 'hono';
import { logger } from './middleware/logger';
import { cors } from './middleware/cors';
import { env } from './config/env';

// Feature routes
import { healthRoutes } from './features/health';
import { authRoutes } from './features/auth';
import { portfolioRoutes } from './features/portfolio';
import { agentRoutes } from './features/agent';
import { brokersRoutes } from './features/brokers';
import { newsRoutes } from './features/news';
import { onboardingRoutes } from './features/onboarding';
import { twoFactorRoutes } from './features/two-factor';
import { tradeRoutes } from './features/trades';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Mount feature routes
app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/onboarding', onboardingRoutes);
app.route('/api/portfolio', portfolioRoutes);
app.route('/api/two-factor', twoFactorRoutes);
app.route('/api/trades', tradeRoutes);
app.route('/api/agent', agentRoutes);
app.route('/api/brokers', brokersRoutes);
app.route('/api/news', newsRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Little John API',
    version: '1.0.0',
    description: 'AI-powered portfolio management agent',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

const port = parseInt(env.PORT);

console.log(`🚀 Little John API starting on port ${port}`);
console.log(`📊 Environment: ${env.NODE_ENV}`);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`✅ Server running at http://localhost:${port}`);
