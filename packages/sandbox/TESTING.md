# Testing the Robinhood Automation

## Quick Start

### Option 1: Using the Shell Script (Recommended)

The easiest way to test the complete Robinhood automation flow:

```bash
# From the sandbox directory
./test-robinhood-automation.sh

# Or using npm/bun
bun run test:robinhood
```

**What it does:**
1. ✅ Checks backend is running
2. ✅ Validates environment variables
3. ✅ Cleans up existing processes
4. ✅ Starts sandbox server
5. ✅ Calls /init endpoint
6. ✅ Displays results with portfolio data
7. ✅ Keeps browser open for inspection

**Expected duration:** 30-60 seconds

### Option 2: Manual Testing

If you prefer manual control:

```bash
# Terminal 1: Start backend
cd packages/backend
bun run dev

# Terminal 2: Start sandbox
cd packages/sandbox
bun run dev

# Terminal 3: Run test
cd packages/sandbox
bun run test:init
```

## Prerequisites

### 1. Environment Setup

Create `.env` file in the sandbox directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Required
ROBINHOOD_USERNAME=your_robinhood_username
ROBINHOOD_PASSWORD=your_robinhood_password

# Optional
ANTHROPIC_API_KEY=your_api_key
BACKEND_URL=http://localhost:3000
PORT=3001
```

### 2. Backend Running

Ensure the backend is running on port 3000:

```bash
cd packages/backend
bun run dev
```

Verify it's running:
```bash
curl http://localhost:3000/api/health
```

### 3. User ID

Update the user ID in the test script:

**In `test-robinhood-automation.sh`:**
```bash
USER_ID="your-user-id-here"
```

**Or in `test-init.ts`:**
```typescript
const userId = "your-user-id-here";
```

To find your user ID:
```bash
cd packages/backend
bun run get-user-id.ts
```

## What to Expect

### Visual Flow

1. **Browser Opens** - Chrome launches in non-headless mode
2. **Navigation** - Browser navigates to robinhood.com
3. **Login** - Agent fills in credentials and submits
4. **Scraping** - Agent navigates portfolio pages
5. **Updates** - Agent calls backend to update data

### Console Output

```
🚀 Robinhood Automation Test
═══════════════════════════════════════════════════

📋 Step 1: Checking backend server...
✓ Backend is running on port 3000

📋 Step 2: Checking environment variables...
✓ Environment variables configured
  Username: your_username
  Password: ********

📋 Step 3: Cleaning up existing processes...
✓ Port 3001 is available

📋 Step 4: Starting sandbox server...
  Log file: /tmp/sandbox-test-1234567890.log
  Sandbox PID: 12345
✓ Sandbox server is ready

📋 Step 5: Calling /init endpoint...
  Session ID: test-session-1234567890
  User ID: 1qAMfQi7bvqBRIHGi9Da1HVzXdZXW4aU
  Browser: Non-headless (visible)

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

📄 Full Response:
{
  "status": "success",
  "message": "Sandbox initialized successfully with Robinhood automation",
  "session": { ... }
}

═══════════════════════════════════════════════════
              TEST COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════
```

## Troubleshooting

### Browser doesn't open

**Symptom:** Script completes but no browser window appears

**Solution:**
- Check Chrome/Chromium is installed: `which google-chrome`
- Verify port 9222 is available: `lsof -i :9222`
- Try killing existing Chrome: `killall chrome` or `killall chromium`

### Login fails

**Symptom:** Browser opens but login doesn't work

**Possible causes:**
1. **Wrong credentials** - Verify `.env` has correct username/password
2. **2FA enabled** - Robinhood 2FA not currently supported
3. **IP restricted** - Robinhood may block automated logins
4. **Session expired** - Try logging in manually first

**Solutions:**
- Double-check credentials in `.env`
- Disable 2FA temporarily
- Try from a different IP/network
- Clear cookies: Delete user data directory

### Agent gets stuck

**Symptom:** Script hangs for long time

**Possible causes:**
1. **Page didn't load** - Network issues
2. **Element not found** - Page structure changed
3. **Wrong selector** - DOM snapshot missed element

**Solutions:**
- Check logs: `tail -f /tmp/sandbox-test-*.log`
- Increase maxTurns in `src/routes/init.ts`
- Update selectors if Robinhood UI changed

### Backend update fails

**Symptom:** Portfolio data not saved

**Check:**
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check user exists
curl http://localhost:3000/api/portfolio/performance \
  -H "X-User-Id: your-user-id"
```

**Solution:**
- Restart backend
- Check database connection
- Verify user ID exists

### Port already in use

**Symptom:** Error: "EADDRINUSE: port 3001 in use"

**Solution:**
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9

# Or run cleanup in script
./test-robinhood-automation.sh  # It auto-cleans
```

## Logs and Debugging

### Log Locations

**Sandbox logs:**
```bash
# Latest test log
ls -lt /tmp/sandbox-test-*.log | head -1

# View live
tail -f /tmp/sandbox-test-*.log
```

**Response files:**
```bash
# Latest response
ls -lt /tmp/init-response-*.json | head -1

# Pretty print
cat /tmp/init-response-*.json | python3 -m json.tool
```

### Enable Verbose Logging

In `src/routes/init.ts`, the logging is already detailed:
- `log.info()` - Informational messages
- `log.error()` - Error messages with context

### Debug Mode

To see all Claude agent messages, add logging in the query loop:

```typescript
for await (const sdkMessage of query(...)) {
  console.log('Message:', JSON.stringify(sdkMessage, null, 2));
  // ...
}
```

## Performance

**Typical execution times:**
- Browser launch: 2-3 seconds
- Navigation to Robinhood: 1-2 seconds
- Login process: 3-5 seconds
- Portfolio scraping: 5-10 seconds
- Backend updates: 1-2 seconds
- **Total: 30-60 seconds**

**Factors affecting speed:**
- Network latency
- Robinhood page load time
- Number of positions to scrape
- AI agent reasoning time

## Cleanup

### Stop Everything

```bash
# Kill sandbox
kill $(lsof -ti:3001)

# Kill backend
kill $(lsof -ti:3000)

# Kill Chrome
killall chrome  # or chromium
```

### Clean Logs

```bash
# Remove test logs
rm /tmp/sandbox-test-*.log
rm /tmp/init-response-*.json
```

## Next Steps

After successful testing:

1. **Production Setup**
   - Use headless mode for production
   - Set up proper credentials management
   - Add error alerting

2. **Scheduling**
   - Set up cron job for periodic updates
   - Add rate limiting
   - Implement retry logic

3. **Monitoring**
   - Track success/failure rates
   - Monitor portfolio update frequency
   - Set up alerts for failures

## Related Documentation

- [Robinhood Automation Guide](./ROBINHOOD-AUTOMATION.md)
- [MCP Architecture](./MCP-ARCHITECTURE.md)
- [Portfolio Tools](./src/mcp/portfolio-tools/README.md)
