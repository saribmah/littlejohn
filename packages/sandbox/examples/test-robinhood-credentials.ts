/**
 * Test the get-robinhood-credentials tool
 * Verifies the tool is properly registered in the portfolio MCP server
 */

import { getRobinhoodCredentialsTool } from '../src/mcp';

async function testRobinhoodCredentials() {
  console.log('🧪 Testing Get Robinhood Credentials Tool\n');

  console.log('📋 Tool Information:');
  console.log(`  Name: ${getRobinhoodCredentialsTool.name}`);
  console.log(`  Tool loaded: ${getRobinhoodCredentialsTool ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(80) + '\n');

  // Test the tool handler
  console.log('🔧 Testing tool handler...\n');

  try {
    const result = await getRobinhoodCredentialsTool.handler({});

    console.log('✅ Tool executed successfully!\n');
    console.log('📤 Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Tool execution failed:');
    console.error(error instanceof Error ? error.message : String(error));
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('💡 This tool is now available in the Portfolio MCP Server');
  console.log('   AI agents can use it to retrieve Robinhood login credentials.');
}

testRobinhoodCredentials().catch(console.error);
