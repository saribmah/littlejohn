# Portfolio MCP Tools

Four MCP tools that allow the AI agent to manage user portfolio data and retrieve Robinhood credentials.

## Tools Overview

### 1. `get-robinhood-credentials`

Retrieves the Robinhood account credentials (username and password) for logging in.

**Parameters:**
- None

**Returns:**
- `username`: Robinhood account username
- `password`: Robinhood account password

**Example Response:**
```
Robinhood Credentials

Username: your_username
Password: your_password

Use these credentials to fill in the Robinhood login form.
```

**Configuration:**
Set the following environment variables in `.env`:
```bash
ROBINHOOD_USERNAME=your_robinhood_username
ROBINHOOD_PASSWORD=your_robinhood_password
```

### 2. `get-robinhood-text-code`

Retrieves the user's 2FA text code from the backend with automatic retry logic.

**Parameters:**
- `userId` (required): User ID to get the 2FA code for
- `use` (optional): Boolean - If true, marks the code as consumed (enabled=false). Default: false

**Returns:**
- 2FA code to use for Robinhood authentication

**Behavior:**
- Only retrieves enabled 2FA codes (enabled=true)
- If 2FA code is found: Returns the code immediately
- If `use=true`: Marks the code as used after retrieval
- If no code is found: Retries every 1 minute for up to 3 attempts
- After 3 failed attempts: Returns error asking user to configure 2FA
- Used codes won't be returned in future calls

**Example:**
```typescript
{
  userId: "user-123",
  use: true  // Mark as used after retrieving
}
```

**Example Response (Success with use=true):**
```
2FA Code Retrieved (marked as used)

Code: 123456

Use this code to complete the 2FA verification on Robinhood.
```

**Example Response (Success with use=false):**
```
2FA Code Retrieved

Code: 123456

Use this code to complete the 2FA verification on Robinhood.
```

**Example Response (Waiting):**
```
No 2FA code found (Attempt 1/3)

Waiting 1 minute for user to add their 2FA code...
The user should add their 2FA backup code in the dashboard.

Retrying in 60 seconds...
```

**Example Response (Failed):**
```
Error: No 2FA code configured after 3 attempts.
Please ask the user to add their Robinhood 2FA backup code in the dashboard.
```

### 3. `update-user-portfolio`

Updates the user's portfolio performance metrics.

**Parameters:**
- `userId` (required): User ID to update portfolio for
- `currentValue` (required): Current total portfolio value in dollars
- `dayChangeValue` (required): Day change in dollars
- `dayChangePercentage` (required): Day change as percentage
- `weekChangeValue` (optional): Week change in dollars
- `weekChangePercentage` (optional): Week change as percentage
- `monthChangeValue` (optional): Month change in dollars
- `monthChangePercentage` (optional): Month change as percentage
- `threeMonthChangeValue` (optional): 3-month change in dollars
- `threeMonthChangePercentage` (optional): 3-month change as percentage
- `yearChangeValue` (optional): Year change in dollars
- `yearChangePercentage` (optional): Year change as percentage

**Example:**
```typescript
{
  userId: "user-123",
  currentValue: 52000,
  dayChangeValue: 1250,
  dayChangePercentage: 2.5,
  weekChangeValue: 2100,
  weekChangePercentage: 4.2,
  monthChangeValue: 4500,
  monthChangePercentage: 9.5,
  yearChangeValue: 12000,
  yearChangePercentage: 30.0
}
```

### 4. `update-user-positions`

Updates all positions in the user's portfolio. Replaces existing positions with new data.

**Parameters:**
- `userId` (required): User ID to update positions for
- `positions` (required): Array of position objects

**Position Object:**
- `symbol`: Stock symbol (e.g., AAPL, GOOGL, MSFT)
- `quantity`: Number of shares held
- `averagePrice`: Average purchase price per share
- `currentPrice`: Current market price per share
- `marketValue`: Total market value (quantity × currentPrice)
- `totalReturn`: Total return in dollars
- `totalReturnPercent`: Total return as percentage
- `dayReturn`: Day return in dollars
- `dayReturnPercent`: Day return as percentage

**Example:**
```typescript
{
  userId: "user-123",
  positions: [
    {
      symbol: "AAPL",
      quantity: 15,
      averagePrice: 160.0,
      currentPrice: 185.50,
      marketValue: 2782.5,
      totalReturn: 382.5,
      totalReturnPercent: 15.9,
      dayReturn: 45.0,
      dayReturnPercent: 1.6
    },
    {
      symbol: "NVDA",
      quantity: 25,
      averagePrice: 220.0,
      currentPrice: 290.00,
      marketValue: 7250.0,
      totalReturn: 1750.0,
      totalReturnPercent: 31.8,
      dayReturn: 125.0,
      dayReturnPercent: 1.8
    }
  ]
}
```

## Use Cases

The AI agent can use these tools to:

1. **Login to Robinhood** - Retrieve credentials to authenticate with the Robinhood platform
2. **Handle 2FA** - Wait for and retrieve the user's 2FA code during login
3. **Update portfolio after trades** - When executing buy/sell orders through Robinhood, update the portfolio state
4. **Sync market data** - After fetching current prices, recalculate and update portfolio metrics
5. **Track performance** - Maintain accurate portfolio performance across different time periods
6. **Manage positions** - Add, remove, or update positions as trades are executed

## Backend Integration

These tools communicate with the backend via:
- `POST /api/portfolio/sandbox/update` - Updates portfolio performance
- `POST /api/portfolio/sandbox/positions` - Updates positions

Authentication is handled via `X-User-Id` header.

## Testing

Run the test scripts to verify the tools work:

```bash
# Test all portfolio tools
bun run examples/test-portfolio-tools.ts

# Test Robinhood credentials tool
bun run examples/test-robinhood-credentials.ts
```

## Implementation Details

- Tools use the `backendClient` from `src/clients` to communicate with the backend
- Data is validated using Zod schemas
- Returns formatted success/error messages for the AI agent
- All updates are atomic and persisted to the database immediately
