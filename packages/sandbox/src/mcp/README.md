# MCP Servers

The sandbox provides two separate MCP servers for different functionality domains.

## Architecture

```
src/mcp/
├── server.ts              # Browser MCP Server
├── tools/                 # Browser automation tools
│   ├── browser-navigate.ts
│   ├── browser-click.ts
│   ├── browser-type.ts
│   └── ... (other browser tools)
├── portfolio-tools/       # Portfolio MCP Server
│   ├── server.ts          # Portfolio server config
│   ├── update-user-portfolio.ts
│   ├── update-user-positions.ts
│   └── README.md
└── index.ts               # Exports both servers
```

## MCP Servers

### 1. Browser MCP Server

**Name**: `browser-tools`
**Purpose**: Browser automation and web interaction

**Tools**:
- `browser-navigate` - Navigate to URLs
- `browser-click` - Click elements
- `browser-type` - Type into inputs
- `browser-select` - Select from dropdowns
- `browser-info` - Get page information
- `browser-get-dom-snapshot` - Get DOM snapshot
- `browser-list-tabs` - List browser tabs
- `browser-create-tab` - Create new tab
- `browser-close-tab` - Close tab
- `browser-switch-tab` - Switch active tab

### 2. Portfolio MCP Server

**Name**: `portfolio-tools`
**Purpose**: Portfolio management, position updates, and Robinhood credentials

**Tools**:
- `get-robinhood-credentials` - Get Robinhood login credentials
- `get-robinhood-text-code` - Get 2FA code with retry logic
- `update-user-portfolio` - Update portfolio performance metrics
- `update-user-positions` - Update all portfolio positions

## Usage

### Importing Both Servers

```typescript
import { browserMcpServer, portfolioMcpServer } from './mcp';

// Use browser server for web automation
const browserServer = browserMcpServer;

// Use portfolio server for portfolio management
const portfolioServer = portfolioMcpServer;
```

### Importing Individual Tools

```typescript
import {
  browserNavigateTool,
  getRobinhoodCredentialsTool,
  updateUserPortfolioTool,
} from './mcp';

// Use individual tools directly
await browserNavigateTool.handler({ url: 'https://example.com' });
await getRobinhoodCredentialsTool.handler({});
```

## Why Separate Servers?

1. **Separation of Concerns**: Browser automation and portfolio management are distinct domains
2. **Independent Initialization**: Each server can be initialized separately based on use case
3. **Easier Maintenance**: Tools are organized by their functional domain
4. **Scalability**: Easy to add new servers for other domains (e.g., trading, analytics)

## Testing

Test both servers:
```bash
bun run examples/test-mcp-servers.ts
```

Test portfolio tools specifically:
```bash
bun run examples/test-portfolio-tools.ts
```

## Adding New Tools

### To Browser Server

1. Create tool in `src/mcp/tools/your-tool.ts`
2. Import and add to `src/mcp/server.ts`
3. Export from `src/mcp/index.ts`

### To Portfolio Server

1. Create tool in `src/mcp/portfolio-tools/your-tool.ts`
2. Import and add to `src/mcp/portfolio-tools/server.ts`
3. Export from `src/mcp/portfolio-tools/index.ts`
4. Export from `src/mcp/index.ts`

### Creating New Server

1. Create directory `src/mcp/your-domain-tools/`
2. Create `server.ts` with MCP server config
3. Create `index.ts` to export server and tools
4. Export server from `src/mcp/index.ts`
