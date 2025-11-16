# Quick Start Guide

## Test Robinhood Automation in 3 Steps

### 1. Configure Credentials

```bash
# Copy example environment file
cp .env.example .env

# Edit and add your credentials
nano .env
```

Add your Robinhood credentials:
```bash
ROBINHOOD_USERNAME=your_robinhood_username
ROBINHOOD_PASSWORD=your_robinhood_password
```

### 2. Start Backend

```bash
# In packages/backend directory
cd ../backend
bun run dev
```

Wait for: `Started development server: http://localhost:3000`

### 3. Run Test Script

```bash
# In packages/sandbox directory
cd ../sandbox
bun run test:robinhood
```

**Or manually:**
```bash
./test-robinhood-automation.sh
```

## What Happens

The script will:
1. ✅ Check backend is running
2. ✅ Validate environment variables
3. ✅ Start sandbox server
4. ✅ Open browser and navigate to Robinhood
5. ✅ Login with credentials
6. ✅ Scrape portfolio data
7. ✅ Update backend database
8. ✅ Display results

**Duration:** 30-60 seconds

## Expected Output

```
🚀 Robinhood Automation Test
═══════════════════════════════════════════════════

📋 Step 1: Checking backend server...
✓ Backend is running on port 3000

📋 Step 2: Checking environment variables...
✓ Environment variables configured

📋 Step 3: Cleaning up existing processes...
✓ Port 3001 is available

📋 Step 4: Starting sandbox server...
✓ Sandbox server is ready

📋 Step 5: Calling /init endpoint...
⏳ Starting Robinhood automation...
   This will take 30-60 seconds
   The browser will open and navigate to Robinhood

📋 Step 6: Processing response...
✓ Request successful (HTTP 200)

═══════════════════════════════════════════════════
                  RESULTS
═══════════════════════════════════════════════════

💰 Portfolio Performance:
   Current Value: $52000.00
   Day Change: $1250.50

📊 Positions: 5 positions found

═══════════════════════════════════════════════════
              TEST COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════
```

## Troubleshooting

### Backend not running
```bash
cd packages/backend
bun run dev
```

### Missing credentials
```bash
# Check .env file exists and has:
ROBINHOOD_USERNAME=...
ROBINHOOD_PASSWORD=...
```

### Port already in use
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Run script again
bun run test:robinhood
```

### Browser issues
```bash
# Install Chromium
bun run postinstall

# Or install manually
playwright install chromium
```

## Manual Testing

If you prefer step-by-step control:

```bash
# Terminal 1: Backend
cd packages/backend && bun run dev

# Terminal 2: Sandbox
cd packages/sandbox && bun run dev

# Terminal 3: Test
cd packages/sandbox && bun run test:init
```

## Next Steps

- ✅ Test completed? See [ROBINHOOD-AUTOMATION.md](./ROBINHOOD-AUTOMATION.md) for details
- 📖 Full testing guide? See [TESTING.md](./TESTING.md)
- 🏗️ Architecture details? See [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md)

## Available Commands

```bash
# Start sandbox server
bun run dev

# Test Robinhood automation (full flow)
bun run test:robinhood

# Test init endpoint (requires server running)
bun run test:init

# Test MCP servers
bun run examples/test-mcp-servers.ts

# Test portfolio tools
bun run examples/test-portfolio-tools.ts

# Test Robinhood credentials tool
bun run examples/test-robinhood-credentials.ts
```

## Support

For issues, check:
1. Backend is running on port 3000
2. Credentials are set in `.env`
3. Chrome/Chromium is installed
4. No processes using port 3001

Full troubleshooting guide: [TESTING.md](./TESTING.md)
