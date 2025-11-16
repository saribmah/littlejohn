# MCP Architecture

## Overview

The sandbox now provides **two separate MCP servers** for different functionality domains:

1. **Browser MCP Server** - Browser automation and web interaction
2. **Portfolio MCP Server** - Portfolio management, position updates, and Robinhood credentials

## Directory Structure

```
packages/sandbox/src/mcp/
│
├── index.ts                    # Main exports (both servers + all tools)
│
├── server.ts                   # Browser MCP Server config
├── tools/                      # Browser automation tools
│   ├── browser-navigate.ts
│   ├── browser-click.ts
│   ├── browser-type.ts
│   ├── browser-select.ts
│   ├── browser-info.ts
│   ├── browser-get-dom-snapshot.ts
│   ├── browser-list-tabs.ts
│   ├── browser-create-tab.ts
│   ├── browser-close-tab.ts
│   └── browser-switch-tab.ts
│
└── portfolio-tools/            # Portfolio MCP Server
    ├── server.ts               # Portfolio server config
    ├── index.ts                # Portfolio exports
    ├── update-user-portfolio.ts
    ├── update-user-positions.ts
    └── README.md
```

## MCP Servers

### Browser MCP Server

**Name**: `browser-tools`
**Purpose**: Browser automation and web interaction
**Tools**: 10 browser automation tools

```typescript
import { browserMcpServer } from './mcp';

// Server provides:
// - browser-navigate
// - browser-click
// - browser-type
// - browser-select
// - browser-info
// - browser-get-dom-snapshot
// - browser-list-tabs
// - browser-create-tab
// - browser-close-tab
// - browser-switch-tab
```

### Portfolio MCP Server

**Name**: `portfolio-tools`
**Purpose**: Portfolio management, position updates, and Robinhood credentials
**Tools**: 4 portfolio management tools

```typescript
import { portfolioMcpServer } from './mcp';

// Server provides:
// - get-robinhood-credentials
// - get-robinhood-text-code
// - update-user-portfolio
// - update-user-positions
```

## AI Agent Usage

When the AI agent connects via `/message` endpoint, it has access to **both** MCP servers:

```typescript
// routes/message.ts
mcpServers: {
  'browser-tools': browserMcpServer,      // 10 browser tools
  'portfolio-tools': portfolioMcpServer,  // 4 portfolio tools
}
```

This means the AI can:
1. **Get login credentials** using `get-robinhood-credentials`
2. **Navigate to Robinhood** using `browser-navigate`
3. **Interact with the UI** using `browser-click`, `browser-type`, etc.
4. **Handle 2FA** using `get-robinhood-text-code` (with automatic retry)
5. **Extract portfolio data** using `browser-get-dom-snapshot`
6. **Update backend** using `update-user-portfolio` and `update-user-positions`

## Benefits of Separate Servers

1. **Separation of Concerns**
   - Browser automation ≠ Portfolio management
   - Each server has a clear, focused purpose

2. **Independent Initialization**
   - Can use just browser tools without portfolio
   - Can use portfolio tools independently for testing

3. **Easier Maintenance**
   - Tools organized by domain
   - Clear boundaries between functionality

4. **Scalability**
   - Easy to add new servers (e.g., `trading-tools`, `analytics-tools`)
   - Each server can evolve independently

## Usage Examples

### Import Both Servers
```typescript
import { browserMcpServer, portfolioMcpServer } from './mcp';
```

### Import Specific Tools
```typescript
import {
  browserNavigateTool,
  updateUserPortfolioTool,
} from './mcp';
```

### Use in Message Handler
```typescript
// AI agent gets access to all tools from both servers
query({
  prompt: message,
  options: {
    mcpServers: {
      'browser-tools': browserMcpServer,
      'portfolio-tools': portfolioMcpServer,
    }
  }
});
```

## Testing

```bash
# Test both servers
bun run examples/test-mcp-servers.ts

# Test portfolio tools specifically
bun run examples/test-portfolio-tools.ts

# Test browser + portfolio integration
bun run test:init
```

## Adding New Servers

To add a new MCP server domain:

1. Create directory: `src/mcp/your-domain-tools/`
2. Create `server.ts` with server config
3. Create `index.ts` to export server and tools
4. Add tools to the directory
5. Export server from `src/mcp/index.ts`
6. Add to `mcpServers` in `routes/message.ts`

## Migration Notes

**Old Structure** (Single Server):
- ❌ `customMcpServer` - Single server with all tools mixed

**New Structure** (Separate Servers):
- ✅ `browserMcpServer` - Browser automation only
- ✅ `portfolioMcpServer` - Portfolio management only

This provides better organization and makes the codebase more maintainable as we add more functionality.
