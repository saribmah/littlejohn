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

Type check:
```bash
bun run type-check
```

Lint with oxlint:
```bash
bun run lint
```

Run all checks (type-check + lint):
```bash
bun run check
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
- `POST /api/agent/query` - Send query to user's sandbox agent
- `GET /api/agent/stream` - SSE stream for agent responses
- `POST /api/agent/start` - Start user's sandbox instance
- `POST /api/agent/stop` - Stop user's sandbox instance
- `GET /api/agent/status` - Get sandbox and agent status
- `PUT /api/agent/preferences` - Update agent preferences

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

## Database Setup

This project uses Prisma with PostgreSQL.

1. **Start PostgreSQL** (via Docker):
   ```bash
   docker run --name littlejohn-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=littlejohn -p 5432:5432 -d postgres
   ```

2. **Set DATABASE_URL** in `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/littlejohn
   ```

3. **Push database schema**:
   ```bash
   bun run db:push
   ```

4. **Generate Prisma client**:
   ```bash
   bun run db:generate
   ```

## Authentication

The `/api/auth` endpoints are powered by Better Auth with email/password support.

See `src/features/auth/README.md` for detailed authentication documentation.

## Sandbox Integration

The backend manages per-user sandbox instances:

- **Lifecycle Management**: Boots up sandbox when user accesses dashboard, shuts down on logout/timeout
- **Communication**: Routes user queries to appropriate sandbox via SSE
- **Session Management**: Tracks active sandbox instances per user
- **Resource Management**: Monitors and limits sandbox resource usage

## Next Steps

- [x] Set up authentication with Better Auth
- [x] Configure Prisma database
- [x] Set up basic sandbox structure
- [ ] Implement sandbox lifecycle management
- [ ] Add sandbox-to-backend communication layer
- [ ] Implement broker adapter interfaces
- [ ] Add authentication middleware for protected routes
- [ ] Implement portfolio routes
- [ ] Add agent routes with sandbox integration
- [ ] Integrate market data services
