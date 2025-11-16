# Robinhood Automation Integration

## Overview

The `/init` endpoint now includes automated Robinhood portfolio synchronization using Claude AI agent with MCP tools.

## What Happens During Init

1. **Browser Launch** - Launches Chrome with stealth mode enabled
2. **Tab Management** - Initializes browser tab management system
3. **Portfolio Fetch** - Retrieves existing portfolio data from backend
4. **Robinhood Automation** - Claude agent executes automated workflow:
   - Navigates to robinhood.com
   - Retrieves credentials using `get-robinhood-credentials` tool
   - Logs in to Robinhood account
   - Extracts portfolio performance metrics
   - Extracts all position data
   - Updates backend using `update-user-portfolio` tool
   - Updates backend using `update-user-positions` tool
5. **Return Results** - Returns updated portfolio and positions in response

## Architecture

### System Prompt
- Location: `src/prompt/anthropic.txt`
- Contains instructions for browser automation and portfolio management
- Defines agent behavior, tone, and tool usage patterns

### User Prompt
```
Go to robinhood.com and login by grabbing the credentials from the tool call,
and then try to update the user portfolio and positions by looking at the user
portfolio on the page. The userId is "{userId}".
```

### MCP Servers Used

**Browser Tools** (10 tools):
- browser-navigate
- browser-click
- browser-type
- browser-select
- browser-info
- browser-get-dom-snapshot
- browser-list-tabs
- browser-create-tab
- browser-close-tab
- browser-switch-tab

**Portfolio Tools** (3 tools):
- get-robinhood-credentials
- update-user-portfolio
- update-user-positions

## Configuration

### Environment Variables Required

```bash
# Required for Robinhood login
ROBINHOOD_USERNAME=your_robinhood_username
ROBINHOOD_PASSWORD=your_robinhood_password

# Optional
ANTHROPIC_API_KEY=your_api_key
BACKEND_URL=http://localhost:3000
PORT=3001
```

### Query Options

```typescript
{
  maxTurns: 20,                          // Maximum conversation turns
  permissionMode: 'bypassPermissions',   // No manual approvals needed
  systemPrompt: '<loaded from file>',    // System instructions
  mcpServers: {
    'browser-tools': browserMcpServer,
    'portfolio-tools': portfolioMcpServer,
  }
}
```

## API Endpoint

### POST /init

**Request:**
```json
{
  "sessionID": "unique-session-id",
  "userId": "user-id-from-database",
  "options": {
    "browserPort": 9222,
    "headless": false
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Sandbox initialized successfully with Robinhood automation",
  "session": {
    "sessionID": "unique-session-id",
    "userId": "user-id-from-database",
    "browser": {
      "port": 9222,
      "pid": 12345,
      "headless": false,
      "stealth": true
    },
    "tabs": {
      "count": 1,
      "activeTabId": "tab-id",
      "tabs": [...]
    },
    "portfolio": {
      "currentValue": 52000,
      "dayChange": { "value": 1250, "percentage": 2.5 },
      "weekChange": { "value": 2100, "percentage": 4.2 },
      ...
    },
    "positions": [
      {
        "symbol": "AAPL",
        "quantity": 15,
        "currentPrice": 185.50,
        "marketValue": 2782.50,
        ...
      }
    ]
  },
  "timestamp": "2025-11-15T23:45:00.000Z"
}
```

## Testing

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env with your Robinhood credentials

# 2. Start the sandbox server
bun run dev

# 3. In another terminal, run the test
bun run test-init.ts
```

**Note**: The test will take longer than a simple init due to:
- Navigation to Robinhood
- Login process
- Page scraping
- Backend updates

Expect 30-60 seconds for completion depending on page load times.

## Error Handling

The automation includes robust error handling:

1. **Credential Errors** - If credentials are missing, init continues but automation is skipped
2. **Login Failures** - Logged but doesn't fail the init endpoint
3. **Backend Update Failures** - Logged but returns last known good data
4. **Browser Errors** - Browser process cleanup on failure

All errors are logged with detailed context for debugging.

## Logging

Detailed logs are output during automation:

```
INFO: starting robinhood automation
INFO: loaded system prompt (length: 12345)
INFO: executing claude query (promptLength: 234)
INFO: received message from claude (role: assistant, type: text)
INFO: robinhood automation completed (messageCount: 42)
INFO: updated portfolio data fetched (currentValue: 52000, positionsCount: 5)
```

## Implementation Details

### File: `src/routes/init.ts`

Key changes:
1. Imported `query` from Claude Agent SDK
2. Imported both MCP servers
3. Added file system imports for reading system prompt
4. Added automation execution after browser init
5. Fetch updated portfolio data after automation completes
6. Updated response message to indicate automation ran

### System Prompt

The agent follows these principles:
- Realistic user interaction (no URL construction)
- Use search boxes and forms naturally
- Take DOM snapshots before interactions
- Track tasks with TodoWrite tool
- Concise, direct communication
- Proactive but not surprising

## Security Considerations

1. **Credentials Storage**: Robinhood credentials stored in .env (gitignored)
2. **Stealth Mode**: Browser runs with anti-detection measures
3. **Session Isolation**: Each user gets isolated browser instance
4. **Permission Mode**: Bypass mode used for autonomous operation
5. **HTTPS Only**: All Robinhood communication over HTTPS

## Future Enhancements

Potential improvements:
- 2FA support for Robinhood login
- Scheduled portfolio updates (cron job)
- Real-time portfolio tracking with websockets
- Multiple brokerage support (TD Ameritrade, E*TRADE, etc.)
- Portfolio performance history tracking
- Alert system for significant portfolio changes

## Troubleshooting

### Browser doesn't launch
- Check port 9222 is not in use
- Verify Chrome/Chromium is installed
- Check stealth plugin compatibility

### Login fails
- Verify credentials in .env
- Check for 2FA requirements
- Ensure Robinhood account is active

### Portfolio not updating
- Check backend is running (port 3000)
- Verify userId exists in database
- Check network connectivity to backend

### Agent gets stuck
- Increase maxTurns if complex workflow
- Check DOM snapshot is returning elements
- Verify page loaded completely before scraping

## Related Documentation

- [MCP Architecture](./MCP-ARCHITECTURE.md)
- [Portfolio Tools](./src/mcp/portfolio-tools/README.md)
- [Browser Automation](./src/browser/README.md)
