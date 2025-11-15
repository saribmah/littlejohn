/**
 * Test script for /init endpoint
 * 
 * Usage:
 *   1. Start the sandbox server: bun run dev
 *   2. In another terminal: bun run test-init.ts
 */

const BASE_URL = 'http://localhost:3001'; // Sandbox runs on 3001, backend on 3000

interface InitResponse {
  status: string;
  message: string;
  session?: {
    sessionID: string;
    userId?: string;
    browser: {
      port: number;
      pid: number;
      headless: boolean;
      stealth: boolean;
    };
    tabs: {
      count: number;
      activeTabId: string | null;
      tabs: Array<{
        id: string;
        url: string;
        title: string;
      }>;
    };
    portfolio?: any;
    positions?: any[];
  };
  timestamp: string;
  error?: string;
  details?: string;
}

async function testInit() {
  console.log('🧪 Testing /init endpoint...\n');

  const sessionID = `test-session-${Date.now()}`;
  // NOTE: Replace with a real user ID from your database
  // You can get this by running: cd packages/backend && bun run get-user-id.ts
  const userId = '1qAMfQi7bvqBRIHGi9Da1HVzXdZXW4aU'; // sarib@gmail.com

  const requestBody = {
    sessionID,
    userId,
    options: {
      browserPort: 9222,
      headless: false, // Use headed mode for visibility
    },
  };

  console.log('📤 Sending request:');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('');

  try {
    const response = await fetch(`${BASE_URL}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json() as InitResponse;

    if (!response.ok) {
      console.error('❌ Request failed:');
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${data.error}`);
      console.error(`Details: ${data.details}`);
      process.exit(1);
    }

    console.log('✅ Initialization successful!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.session) {
      console.log('\n📋 Session Summary:');
      console.log(`  Session ID: ${data.session.sessionID}`);
      console.log(`  User ID: ${data.session.userId || 'N/A'}`);
      console.log(`  Browser Port: ${data.session.browser.port}`);
      console.log(`  Browser PID: ${data.session.browser.pid}`);
      console.log(`  Headless: ${data.session.browser.headless}`);
      console.log(`  Stealth Mode: ${data.session.browser.stealth}`);
      console.log(`  Active Tabs: ${data.session.tabs.count}`);
      console.log(`  Active Tab ID: ${data.session.tabs.activeTabId || 'N/A'}`);
      
      if (data.session.tabs.tabs.length > 0) {
        console.log('\n🗂️  Tabs:');
        data.session.tabs.tabs.forEach((tab, idx) => {
          console.log(`  ${idx + 1}. ${tab.title}`);
          console.log(`     URL: ${tab.url}`);
          console.log(`     ID: ${tab.id}`);
        });
      }

      // Display portfolio data
      if (data.session.portfolio) {
        console.log('\n💰 Portfolio Performance:');
        console.log(`  Current Value: $${data.session.portfolio.currentValue.toFixed(2)}`);
        console.log(`  Day Change: $${data.session.portfolio.dayChange.value.toFixed(2)} (${data.session.portfolio.dayChange.percentage.toFixed(2)}%)`);
        console.log(`  Week Change: $${data.session.portfolio.weekChange.value.toFixed(2)} (${data.session.portfolio.weekChange.percentage.toFixed(2)}%)`);
        console.log(`  Month Change: $${data.session.portfolio.monthChange.value.toFixed(2)} (${data.session.portfolio.monthChange.percentage.toFixed(2)}%)`);
        console.log(`  Year Change: $${data.session.portfolio.yearChange.value.toFixed(2)} (${data.session.portfolio.yearChange.percentage.toFixed(2)}%)`);
      } else {
        console.log('\n💰 Portfolio: No data available');
      }

      // Display positions
      if (data.session.positions && data.session.positions.length > 0) {
        console.log('\n📊 Positions:');
        data.session.positions.forEach((pos, idx) => {
          console.log(`  ${idx + 1}. ${pos.symbol}`);
          console.log(`     Quantity: ${pos.quantity}`);
          console.log(`     Current Price: $${pos.currentPrice.toFixed(2)}`);
          console.log(`     Market Value: $${pos.marketValue.toFixed(2)}`);
          console.log(`     Total Return: $${pos.totalReturn.toFixed(2)} (${pos.totalReturnPercent.toFixed(2)}%)`);
        });
      } else {
        console.log('\n📊 Positions: No positions available');
      }
    }

    console.log('\n✨ Test completed successfully!');
    console.log('\n⚠️  Note: Browser is still running. Kill it manually or restart the server.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testInit();
