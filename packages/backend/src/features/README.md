# Features Directory

This directory contains feature-based modules for the Little John backend. Each feature is self-contained with its own routes, services, types, and utilities.

## Structure

Each feature directory follows this structure:

```
feature-name/
├── index.ts           # Public exports
├── routes.ts          # HTTP route handlers
├── service.ts         # Business logic (optional)
├── types.ts           # Feature-specific TypeScript types (optional)
├── utils.ts           # Feature-specific helper functions (optional)
└── README.md          # Feature documentation (optional)
```

**Important**: All types, services, and utilities should be feature-specific. There is no global `types/` or `services/` directory.

## Available Features

### Health
Health check and readiness endpoints for monitoring.

**Routes:**
- `GET /health` - Server health status
- `GET /health/ready` - Readiness check

### Auth
Authentication and authorization.

**Routes:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Portfolio
Portfolio management and tracking.

**Routes:**
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/portfolio/:broker` - Get broker-specific portfolio
- `GET /api/portfolio/positions` - Get all positions
- `GET /api/portfolio/performance` - Get performance metrics

### Agent
AI agent control and configuration.

**Routes:**
- `POST /api/agent/start` - Start agent with config
- `POST /api/agent/stop` - Stop agent
- `GET /api/agent/status` - Get agent status
- `PUT /api/agent/preferences` - Update preferences

### Brokers
Broker integrations and connections.

**Routes:**
- `GET /api/brokers` - List supported brokers
- `POST /api/brokers/connect` - Connect broker account
- `DELETE /api/brokers/:broker` - Disconnect broker
- `GET /api/brokers/:broker/status` - Get broker status

### News
News feed and sentiment analysis.

**Routes:**
- `GET /api/news` - Get news feed
- `GET /api/news/:symbol` - Get symbol-specific news
- `GET /api/news/:symbol/sentiment` - Get sentiment analysis

## Adding a New Feature

1. Create a new directory in `features/`
2. Add `index.ts` to export the feature's public API
3. Add `routes.ts` with Hono route handlers
4. Add additional files as needed (service, types, utils)
5. Mount the routes in `src/index.ts`

Example:

```typescript
// features/my-feature/routes.ts
import { Hono } from 'hono';

const myFeature = new Hono();

myFeature.get('/', (c) => {
  return c.json({ message: 'Hello from my feature' });
});

export default myFeature;

// features/my-feature/index.ts
export { default as myFeatureRoutes } from './routes';

// src/index.ts
import { myFeatureRoutes } from './features/my-feature';
app.route('/api/my-feature', myFeatureRoutes);
```

## Best Practices

1. **Keep features isolated** - Each feature should be independent
2. **Use clear naming** - Routes, services, and types should be descriptive
3. **Export through index.ts** - Keep feature internals private
4. **Document your routes** - Add comments for complex endpoints
5. **Handle errors consistently** - Use the global error handler
6. **Type everything** - Use TypeScript for better DX
