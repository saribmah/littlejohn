# Portfolio MCP Tools

Two MCP tools that allow the AI agent to update user portfolio data in the backend.

## Tools Overview

### 1. `update-user-portfolio`

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

### 2. `update-user-positions`

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

1. **Update portfolio after trades** - When executing buy/sell orders through Robinhood, update the portfolio state
2. **Sync market data** - After fetching current prices, recalculate and update portfolio metrics
3. **Track performance** - Maintain accurate portfolio performance across different time periods
4. **Manage positions** - Add, remove, or update positions as trades are executed

## Backend Integration

These tools communicate with the backend via:
- `POST /api/portfolio/sandbox/update` - Updates portfolio performance
- `POST /api/portfolio/sandbox/positions` - Updates positions

Authentication is handled via `X-User-Id` header.

## Testing

Run the test script to verify the tools work:

```bash
bun run examples/test-portfolio-tools.ts
```

## Implementation Details

- Tools use the `backendClient` from `src/clients` to communicate with the backend
- Data is validated using Zod schemas
- Returns formatted success/error messages for the AI agent
- All updates are atomic and persisted to the database immediately
