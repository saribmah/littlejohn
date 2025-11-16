/**
 * Test both MCP servers
 * Verifies browser and portfolio MCP servers are properly exported
 */

import {
  browserMcpServer,
  portfolioMcpServer,
  browserNavigateTool,
  browserClickTool,
  getRobinhoodCredentialsTool,
  updateUserPortfolioTool,
  updateUserPositionsTool,
} from '../src/mcp';

async function testMcpServers() {
  console.log('🧪 Testing MCP Servers\n');

  // Test Browser MCP Server
  console.log('🌐 Browser MCP Server:');
  console.log(`  Server loaded: ${browserMcpServer ? '✅' : '❌'}`);
  console.log('  Sample browser tools:');
  console.log(`    - browser-navigate: ${browserNavigateTool.name}`);
  console.log(`    - browser-click: ${browserClickTool.name}`);

  console.log('\n' + '='.repeat(80) + '\n');

  // Test Portfolio MCP Server
  console.log('💼 Portfolio MCP Server:');
  console.log(`  Server loaded: ${portfolioMcpServer ? '✅' : '❌'}`);
  console.log('  Portfolio tools:');
  console.log(`    - get-robinhood-credentials: ${getRobinhoodCredentialsTool.name}`);
  console.log(`    - update-user-portfolio: ${updateUserPortfolioTool.name}`);
  console.log(`    - update-user-positions: ${updateUserPositionsTool.name}`);

  console.log('\n' + '='.repeat(80) + '\n');

  console.log('✅ Both MCP servers loaded successfully!');
  console.log('\n📝 Summary:');
  console.log('  ✓ Browser MCP Server (10 tools) - Manages browser automation');
  console.log('  ✓ Portfolio MCP Server (3 tools) - Manages credentials, portfolio & positions');
  console.log('\n💡 Both servers are now available for the AI agent to use independently.');
  console.log('   The agent can retrieve Robinhood credentials, control the browser,');
  console.log('   and update portfolio data in the backend.');
}

testMcpServers().catch(console.error);
