# Trade Routes API

The Trade API provides endpoints for managing user trades (buy/sell orders).

## Model

```typescript
enum TradeAction {
  BUY
  SELL
}

enum TradeStatus {
  PENDING
  COMPLETED
  CANCELLED
  FAILED
}

interface Trade {
  id: string;
  userId: string;
  symbol: string;      // Ticker symbol (e.g., AAPL, TSLA)
  amount: number;      // Number of shares
  action: TradeAction; // BUY or SELL
  status: TradeStatus; // PENDING, COMPLETED, CANCELLED, or FAILED
  price?: number;      // Optional: Price per share
  total?: number;      // Optional: Total value
  note?: string;       // Optional: Note about the trade
  createdAt: Date;
  updatedAt: Date;
}
```

## Endpoints

### 1. Get All Trades

**GET** `/api/trades`

Get all trades for the authenticated user, ordered by creation date (newest first).

**Response:**
```json
{
  "trades": [
    {
      "id": "trade_123",
      "symbol": "AAPL",
      "amount": 10,
      "action": "BUY",
      "status": "PENDING",
      "price": 185.50,
      "total": 1855.00,
      "note": "Buy Apple stock",
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Trade by ID

**GET** `/api/trades/:id`

Get a specific trade by ID.

**Parameters:**
- `id` (path) - Trade ID

**Response:**
```json
{
  "trade": {
    "id": "trade_123",
    "symbol": "AAPL",
    "amount": 10,
    "action": "BUY",
    "status": "COMPLETED",
    "price": 185.50,
    "total": 1855.00,
    "note": "Buy Apple stock",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:01:00.000Z"
  }
}
```

### 3. Create Trade

**POST** `/api/trades`

Create a new trade.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "amount": 10,
  "action": "BUY",
  "status": "PENDING",     // Optional, defaults to PENDING
  "price": 185.50,         // Optional
  "total": 1855.00,        // Optional
  "note": "Buy Apple stock" // Optional
}
```

**Validation:**
- `symbol` (required) - Must be a string
- `amount` (required) - Must be a positive number
- `action` (required) - Must be "BUY" or "SELL"
- `status` (optional) - Must be "PENDING", "COMPLETED", "CANCELLED", or "FAILED"
- `price` (optional) - Number
- `total` (optional) - Number
- `note` (optional) - String

**Response:**
```json
{
  "trade": {
    "id": "trade_123",
    "symbol": "AAPL",
    "amount": 10,
    "action": "BUY",
    "status": "PENDING",
    "price": 185.50,
    "total": 1855.00,
    "note": "Buy Apple stock",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:00:00.000Z"
  }
}
```

### 4. Update Trade

**PUT** `/api/trades/:id`

Update an existing trade. Only the fields provided in the request body will be updated.

**Parameters:**
- `id` (path) - Trade ID

**Request Body:** (all fields optional)
```json
{
  "symbol": "AAPL",
  "amount": 15,
  "action": "BUY",
  "status": "COMPLETED",
  "price": 186.00,
  "total": 2790.00,
  "note": "Updated trade"
}
```

**Response:**
```json
{
  "trade": {
    "id": "trade_123",
    "symbol": "AAPL",
    "amount": 15,
    "action": "BUY",
    "status": "COMPLETED",
    "price": 186.00,
    "total": 2790.00,
    "note": "Updated trade",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:01:00.000Z"
  }
}
```

### 5. Delete Trade

**DELETE** `/api/trades/:id`

Delete a trade.

**Parameters:**
- `id` (path) - Trade ID

**Response:**
```json
{
  "success": true,
  "message": "Trade deleted successfully"
}
```

### 6. Get Trades by Status

**GET** `/api/trades/status/:status`

Get all trades filtered by status.

**Parameters:**
- `status` (path) - Trade status ("PENDING", "COMPLETED", "CANCELLED", or "FAILED")

**Response:**
```json
{
  "trades": [
    {
      "id": "trade_123",
      "symbol": "AAPL",
      "amount": 10,
      "action": "BUY",
      "status": "PENDING",
      "price": 185.50,
      "total": 1855.00,
      "note": "Buy Apple stock",
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z"
    }
  ]
}
```

## Error Responses

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Trade not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Symbol is required and must be a string"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create trade"
}
```

## Authentication

All endpoints require authentication via session cookies (Better Auth).

## Use Cases

1. **Create a pending buy order:**
   ```bash
   POST /api/trades
   {
     "symbol": "TSLA",
     "amount": 5,
     "action": "BUY",
     "price": 250.00
   }
   ```

2. **Update trade status to completed:**
   ```bash
   PUT /api/trades/trade_123
   {
     "status": "COMPLETED",
     "total": 1250.00
   }
   ```

3. **Get all pending trades:**
   ```bash
   GET /api/trades/status/PENDING
   ```

4. **Cancel a trade:**
   ```bash
   PUT /api/trades/trade_123
   {
     "status": "CANCELLED"
   }
   ```

5. **Delete a failed trade:**
   ```bash
   DELETE /api/trades/trade_123
   ```

## Notes

- Ticker symbols are automatically converted to uppercase
- Trades are scoped to the authenticated user (one user cannot see another user's trades)
- The `status` field defaults to "PENDING" when creating a new trade
- Optional fields (`price`, `total`, `note`) can be used to store additional metadata about the trade
