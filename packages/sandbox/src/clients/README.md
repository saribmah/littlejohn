# Backend Client

The Backend Client allows the sandbox to communicate with the main backend server to manage portfolio and position data.

## Features

- Get portfolio performance data
- Get user positions
- Update portfolio performance
- Create/update positions

## Usage

```typescript
import { backendClient } from './clients';

// Get portfolio performance
const performance = await backendClient.getPortfolioPerformance(userId);

// Get positions
const positions = await backendClient.getPositions(userId);

// Update portfolio
await backendClient.updatePortfolio(userId, {
  currentValue: 47234,
  dayChangeValue: 2456,
  dayChangePercentage: 5.5,
  weekChangeValue: 3200,
  weekChangePercentage: 7.2,
  monthChangeValue: 5000,
  monthChangePercentage: 11.8,
  threeMonthChangeValue: 8000,
  threeMonthChangePercentage: 20.4,
  yearChangeValue: 10000,
  yearChangePercentage: 23.5,
});

// Update positions
await backendClient.updatePositions(userId, [
  {
    symbol: 'AAPL',
    quantity: 10,
    averagePrice: 150.5,
    currentPrice: 182.45,
    marketValue: 1824.5,
    totalReturn: 319.5,
    totalReturnPercent: 21.2,
    dayReturn: 25.5,
    dayReturnPercent: 1.4,
  },
]);
```

## Configuration

Set the `BACKEND_URL` environment variable to point to your backend server:

```bash
BACKEND_URL=http://localhost:3000
```

## Authentication

The client sends the user ID via the `X-User-Id` header. The backend validates this against the user database to ensure the user exists before allowing any operations.

## API Endpoints

### GET `/api/portfolio/performance`
Get portfolio performance data for a user.

### GET `/api/portfolio/positions`
Get all positions for a user's portfolio.

### POST `/api/portfolio/sandbox/update`
Update portfolio performance data (sandbox only).

### POST `/api/portfolio/sandbox/positions`
Create or update positions (sandbox only).
