# Portfolio Feature

This feature provides portfolio performance tracking and visualization.

## Components

### PortfolioTable
Displays portfolio performance metrics in a table format including:
- Current portfolio value
- 1 day change (value and percentage)
- 1 week change (value and percentage)
- 1 month change (value and percentage)
- 3 month change (value and percentage)
- 1 year change (value and percentage)

**Usage:**
```tsx
import { PortfolioTable } from '@/features/portfolio';

function Dashboard() {
  return <PortfolioTable />;
}
```

## State Management

### usePortfolioStore
Zustand store for managing portfolio state.

**State:**
- `performance: PortfolioPerformance | null` - Current portfolio performance data
- `lastUpdated: string | null` - Last update timestamp
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message if any

**Actions:**
- `fetchPerformance()` - Fetches portfolio performance from API
- `clearError()` - Clears error state

**Usage:**
```tsx
import { usePortfolioStore } from '@/features/portfolio';

function MyComponent() {
  const { performance, isLoading, fetchPerformance } = usePortfolioStore();
  
  useEffect(() => {
    fetchPerformance();
  }, []);
  
  // Use performance data...
}
```

## Service

### portfolioService
API service for portfolio-related endpoints.

**Methods:**
- `getPerformance(): Promise<PortfolioPerformanceResponse>` - Fetches portfolio performance data

## Types

```typescript
type PortfolioPerformance = {
  currentValue: number;
  dayChange: { value: number; percentage: number };
  weekChange: { value: number; percentage: number };
  monthChange: { value: number; percentage: number };
  threeMonthChange: { value: number; percentage: number };
  yearChange: { value: number; percentage: number };
};

type PortfolioPerformanceResponse = {
  performance: PortfolioPerformance;
  lastUpdated: string;
};
```

## Backend Integration

The frontend calls the backend API endpoint:
- **GET** `/api/portfolio/performance` - Returns portfolio performance data

## TODO

- [ ] Integrate with real Robinhood data via sandbox agent
- [ ] Add refresh button to manually update data
- [ ] Add auto-refresh with configurable interval
- [ ] Add historical chart visualization
- [ ] Add filtering by broker/account
