# Little John Sandbox

Per-user isolated agent runtime environment with browser automation capabilities.

## Overview

The sandbox is a critical component of Little John's architecture. When a user accesses their dashboard, a dedicated sandbox instance is created for them. This sandbox runs an AI agent that has access to a headless browser, which it uses to:

- Log into the user's Robinhood account
- Read portfolio data and positions in real-time
- Execute trades on behalf of the user
- Answer natural language queries about the portfolio

## Architecture

### Components

- **Browser Automation** (`src/browser/`): Manages headless browser instances for web automation
- **MCP Server** (`src/mcp/`): Model Context Protocol server providing tools for the agent
- **Routes** (`src/routes/`): SSE endpoints for real-time communication with frontend
- **App** (`src/app.ts`): Main sandbox server handling requests and lifecycle

### Communication Flow

```
User Dashboard → SSE → Sandbox → Agent → Browser → Robinhood
                  ↑                        ↓
                  └────── Portfolio Data ───┘
```

1. User sends query from dashboard (e.g., "What's my portfolio value?")
2. Backend routes request to user's sandbox via SSE
3. Agent receives query and determines required actions
4. Agent uses browser tools to interact with Robinhood
5. Data is extracted and returned to user via SSE stream

## Agent Capabilities

The agent has access to the following capabilities via MCP tools:

- **Browser Control**: Navigate, click, type, extract data
- **Portfolio Queries**: Get positions, balances, performance
- **Trade Execution**: Buy, sell, view order status
- **Market Data**: Real-time quotes, news, fundamentals

## Development

Install dependencies:
```bash
bun install
```

Run in development mode with hot reload:
```bash
bun run dev
```

Run in production:
```bash
bun run index.ts
```

## Environment Variables

See `.env.example` for required configuration:

- `SANDBOX_PORT` - Port for sandbox server
- `MCP_SERVER_PORT` - Port for MCP server
- `BROWSER_HEADLESS` - Run browser in headless mode
- `LOG_LEVEL` - Logging verbosity

## Security Considerations

- Each sandbox runs in an isolated process
- Sandboxes are scoped to individual users
- Browser sessions are ephemeral and cleaned up after use
- No cross-user data access
- API keys and credentials are encrypted

## Implementation Status

- [x] Basic sandbox server structure
- [x] MCP server integration
- [x] Browser automation setup
- [x] SSE communication routes
- [ ] Robinhood login automation
- [ ] Portfolio data extraction
- [ ] Trade execution flows
- [ ] User session management
- [ ] Sandbox lifecycle management (boot/shutdown)
