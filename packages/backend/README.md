# Little John Backend

Backend API server for Little John portfolio management agent, built with Hono and Bun.

## Setup

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Fill in your API credentials in `.env`

3. Install dependencies:
```bash
bun install
```

## Development

Run the development server with hot reload:
```bash
bun run dev
```

Run in production mode:
```bash
bun run start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## API Endpoints

### Root
- `GET /` - API information

### Health (`/health`)
- `GET /health` - Server health status
- `GET /health/ready` - Readiness check

### Auth (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Portfolio (`/api/portfolio`)
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/portfolio/:broker` - Get broker-specific portfolio
- `GET /api/portfolio/positions` - Get all positions
- `GET /api/portfolio/performance` - Get performance metrics

### Agent (`/api/agent`)
- `POST /api/agent/start` - Start agent with config
- `POST /api/agent/stop` - Stop agent
- `GET /api/agent/status` - Get agent status
- `PUT /api/agent/preferences` - Update preferences

### Brokers (`/api/brokers`)
- `GET /api/brokers` - List supported brokers
- `POST /api/brokers/connect` - Connect broker account
- `DELETE /api/brokers/:broker` - Disconnect broker
- `GET /api/brokers/:broker/status` - Get broker status

### News (`/api/news`)
- `GET /api/news` - Get news feed
- `GET /api/news/:symbol` - Get symbol-specific news
- `GET /api/news/:symbol/sentiment` - Get sentiment analysis

## Project Structure

```
src/
├── config/       # Configuration and environment variables
├── middleware/   # Hono middleware (logging, CORS, auth)
├── features/     # Feature-based modules (routes, services, types)
│   ├── health/      # Health checks
│   ├── auth/        # Authentication
│   ├── portfolio/   # Portfolio management
│   ├── agent/       # AI agent control
│   ├── brokers/     # Broker integrations
│   └── news/        # News and sentiment
└── utils/        # Shared utility functions (optional)
```

Each feature is completely self-contained with its own routes, services, types, and utilities.

## Environment Variables

See `.env.example` for all required and optional environment variables.

Key variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- Broker credentials (Robinhood, Interactive Brokers, etc.)
- Market data API keys
- LLM API keys (OpenAI, Anthropic)

## Next Steps

- [ ] Implement broker adapter interfaces
- [ ] Add authentication middleware
- [ ] Set up database connection
- [ ] Implement portfolio routes
- [ ] Add agent routes
- [ ] Integrate market data services
