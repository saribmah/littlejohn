# `/init` Endpoint Documentation

## Overview

The `/init` endpoint initializes a new sandbox session for a user. It launches a browser instance with stealth capabilities, establishes a CDP connection, and sets up tab management.

## Endpoint

```
POST /init
```

## Request Body

```typescript
{
  sessionID: string;      // Required: Unique identifier for this session
  userId?: string;        // Optional: User identifier
  options?: {
    browserPort?: number;     // Optional: CDP port (default: 9222)
    headless?: boolean;       // Optional: Headless mode (default: false for stealth)
    userDataDir?: string;     // Optional: Chrome user data directory
  }
}
```

## Response

### Success (200)

```typescript
{
  status: "success",
  message: "Sandbox initialized successfully",
  session: {
    sessionID: string,
    userId?: string,
    browser: {
      port: number,        // CDP port
      pid: number,         // Browser process ID
      headless: boolean,   // Whether running in headless mode
      stealth: boolean     // Whether stealth mode is enabled (always true)
    },
    tabs: {
      count: number,       // Number of open tabs
      activeTabId: string | null,  // ID of currently active tab
      tabs: Array<{
        id: string,        // Tab ID (CDP target ID)
        url: string,       // Current URL
        title: string      // Page title
      }>
    }
  },
  timestamp: string  // ISO timestamp
}
```

### Error (400/500)

```typescript
{
  error: string,      // Error message
  details?: string    // Additional error details
}
```

## What Happens During Initialization

1. **Browser Launch**: Launches Chrome with:
   - CDP enabled on specified port (default: 9222)
   - Stealth mode enabled (anti-detection features)
   - Headed mode by default (less detectable than headless)
   - Custom user data directory for session isolation

2. **CDP Connection**: Establishes Chrome DevTools Protocol connection:
   - Connects to the launched browser
   - Enables Page, Runtime, and Network domains
   - Injects stealth scripts to mask automation signals
   - Retries connection up to 10 times with backoff

3. **Tab Management**: Initializes tab tracking:
   - Discovers initial tab created by browser
   - Sets it as the active tab for the session
   - Enables multi-tab support for the session

## Example Usage

### Using `curl`

```bash
curl -X POST http://localhost:3000/init \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "user-123-session",
    "userId": "user-123",
    "options": {
      "browserPort": 9222,
      "headless": false
    }
  }'
```

### Using the Test Script

```bash
# Terminal 1: Start the server
bun run dev

# Terminal 2: Run the test
bun run test:init
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionID: `session-${Date.now()}`,
    userId: 'user-123',
    options: {
      browserPort: 9222,
      headless: false,
    },
  }),
});

const data = await response.json();
console.log('Session initialized:', data);
```

## Stealth Features

The initialized browser includes anti-detection features for accessing sites like Robinhood:

### Chrome Launch Arguments
- `--disable-blink-features=AutomationControlled` - Removes automation flags
- `--disable-dev-shm-usage` - Prevents memory issues
- `--disable-infobars` - Removes "Chrome is being controlled" banner
- `--window-size=1920,1080` - Realistic window size (not headless default)
- Custom user agent - Recent Chrome version on macOS

### JavaScript Overrides
- `navigator.webdriver` - Set to `false`
- `navigator.plugins` - Populated with realistic Chrome plugins
- `navigator.permissions` - Returns expected values
- `navigator.languages` - Set to `['en-US', 'en']`
- `window.chrome` - Chrome runtime object present

## Session Management

- Each session is isolated with its own browser instance
- Sessions are identified by `sessionID`
- Browser processes continue running until explicitly killed
- Tab state is maintained per session
- Multiple sessions can run concurrently on different ports

## Error Handling

Common errors and solutions:

### "sessionID is required"
**Cause**: Missing `sessionID` in request body  
**Solution**: Include a unique `sessionID` string

### "Failed to launch Chrome"
**Cause**: Chrome executable not found  
**Solution**: Install Chrome or update `chromePaths` in `launcher.ts`

### "Failed to connect to browser after X attempts"
**Cause**: Browser failed to start or CDP port is blocked  
**Solution**: Check if port is available, verify Chrome launched successfully

### "No browser page found"
**Cause**: Browser started but no tabs available  
**Solution**: Wait longer for browser startup, check browser logs

## Next Steps

After initializing a session:

1. **Navigate**: Use browser automation to navigate to URLs
2. **Interact**: Use the `/message` endpoint to interact with the browser via Claude
3. **Manage Tabs**: Create, switch, or close tabs as needed
4. **Execute Trades**: Use the agent to log into Robinhood and execute trades

## Cleanup

Currently, browsers remain running after initialization. To stop a browser:

1. Get the PID from the init response
2. Kill the process: `kill <pid>`
3. Or restart the sandbox server to clean up all browsers
