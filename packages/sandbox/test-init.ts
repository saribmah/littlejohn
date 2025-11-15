/**
 * Test script for /init endpoint
 * 
 * Usage:
 *   1. Start the sandbox server: bun run dev
 *   2. In another terminal: bun run test-init.ts
 */

const BASE_URL = 'http://localhost:3000';

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
  };
  timestamp: string;
  error?: string;
  details?: string;
}

async function testInit() {
  console.log('🧪 Testing /init endpoint...\n');

  const sessionID = `test-session-${Date.now()}`;
  const userId = 'test-user-123';

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
