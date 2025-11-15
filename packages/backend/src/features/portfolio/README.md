# Portfolio Feature - Backend

This feature provides portfolio performance tracking with database persistence.

## Database Schema

### Portfolio Model
```prisma
model Portfolio {
  id        String   @id @default(cuid())
  userId    String   @unique
  
  // Current portfolio value
  currentValue Float @default(0)
  
  // Performance changes
  dayChangeValue       Float @default(0)
  dayChangePercentage  Float @default(0)
  
  weekChangeValue      Float @default(0)
  weekChangePercentage Float @default(0)
  
  monthChangeValue      Float @default(0)
  monthChangePercentage Float @default(0)
  
  threeMonthChangeValue      Float @default(0)
  threeMonthChangePercentage Float @default(0)
  
  yearChangeValue      Float @default(0)
  yearChangePercentage Float @default(0)
  
  lastUpdated DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### GET `/api/portfolio/performance`
Retrieves portfolio performance data for the authenticated user.

**Authentication:** Required (session-based via Better Auth)

**Response:**
```json
{
  "performance": {
    "currentValue": 10000.50,
    "dayChange": {
      "value": 125.30,
      "percentage": 1.27
    },
    "weekChange": {
      "value": 450.00,
      "percentage": 4.71
    },
    "monthChange": {
      "value": 850.25,
      "percentage": 9.31
    },
    "threeMonthChange": {
      "value": 1200.00,
      "percentage": 13.63
    },
    "yearChange": {
      "value": 2500.50,
      "percentage": 33.34
    }
  },
  "lastUpdated": "2025-11-15T12:00:00.000Z"
}
```

**Behavior:**
- Returns 401 if user is not authenticated
- Automatically creates a portfolio record with zero values if none exists
- Returns existing portfolio data if available

### POST `/api/portfolio/performance`
Updates portfolio performance data for the authenticated user.

**Authentication:** Required (session-based via Better Auth)

**Request Body:**
```json
{
  "currentValue": 10000.50,
  "dayChangeValue": 125.30,
  "dayChangePercentage": 1.27,
  "weekChangeValue": 450.00,
  "weekChangePercentage": 4.71,
  "monthChangeValue": 850.25,
  "monthChangePercentage": 9.31,
  "threeMonthChangeValue": 1200.00,
  "threeMonthChangePercentage": 13.63,
  "yearChangeValue": 2500.50,
  "yearChangePercentage": 33.34
}
```

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "id": "...",
    "userId": "...",
    "currentValue": 10000.50,
    // ... all fields
  }
}
```

**Behavior:**
- Returns 401 if user is not authenticated
- Uses upsert to create or update portfolio record
- Automatically updates `lastUpdated` timestamp
- Validates all numeric fields via Zod schema

## Types

### PortfolioPerformance
Response structure for portfolio performance data.

### PortfolioPerformanceResponse
Complete API response including performance data and timestamp.

### UpdatePortfolioInput
Input structure for updating portfolio performance.

## Usage

### From Agent/Sandbox
The agent can update portfolio data by calling the POST endpoint:

```typescript
const response = await fetch(`${API_URL}/api/portfolio/performance`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    currentValue: 10000.50,
    dayChangeValue: 125.30,
    dayChangePercentage: 1.27,
    // ... other fields
  }),
});
```

### Database Access
```typescript
import { prisma } from '../auth/auth';

// Get user's portfolio
const portfolio = await prisma.portfolio.findUnique({
  where: { userId: user.id },
});

// Update portfolio
const updated = await prisma.portfolio.update({
  where: { userId: user.id },
  data: {
    currentValue: 10000.50,
    // ... other fields
    lastUpdated: new Date(),
  },
});
```

## TODO

- [ ] Add middleware to verify agent/sandbox authentication for POST endpoint
- [ ] Add rate limiting for updates
- [ ] Add historical portfolio snapshots table
- [ ] Add portfolio holdings/positions endpoint
- [ ] Add integration with Robinhood API via sandbox agent
