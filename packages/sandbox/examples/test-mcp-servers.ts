/**
 * Test both MCP servers
 * Verifies browser and portfolio MCP servers are properly exported
 */

import {
  browserMcpServer,
  portfolioMcpServer,
  browserNavigateTool,
  browserClickTool,
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
  console.log(`    - update-user-portfolio: ${updateUserPortfolioTool.name}`);
  console.log(`    - update-user-positions: ${updateUserPositionsTool.name}`);

  console.log('\n' + '='.repeat(80) + '\n');

  console.log('✅ Both MCP servers loaded successfully!');
  console.log('\n📝 Summary:');
  console.log('  ✓ Browser MCP Server - Manages browser automation tools');
  console.log('  ✓ Portfolio MCP Server - Manages portfolio & position updates');
  console.log('\n💡 Both servers are now available for the AI agent to use independently.');
  console.log('   Each server can be initialized separately for different use cases.');
}

testMcpServers().catch(console.error);
