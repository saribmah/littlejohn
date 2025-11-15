/**
 * Example demonstrating the portfolio MCP tools
 * This shows how the AI agent would use update-user-portfolio and update-user-positions
 */

import { updateUserPortfolioTool } from '../src/mcp/portfolio-tools/update-user-portfolio';
import { updateUserPositionsTool } from '../src/mcp/portfolio-tools/update-user-positions';

async function testPortfolioTools() {
  const userId = '1qAMfQi7bvqBRIHGi9Da1HVzXdZXW4aU'; // sarib@gmail.com

  console.log('🧪 Testing Portfolio MCP Tools\n');

  // Test 1: Update portfolio
  console.log('📊 Test 1: Updating portfolio performance...');
  const portfolioResult = await updateUserPortfolioTool.handler({
    userId,
    currentValue: 52000,
    dayChangeValue: 1250,
    dayChangePercentage: 2.5,
    weekChangeValue: 2100,
    weekChangePercentage: 4.2,
    monthChangeValue: 4500,
    monthChangePercentage: 9.5,
    yearChangeValue: 12000,
    yearChangePercentage: 30.0,
  });

  console.log('\n✅ Portfolio Update Result:');
  if (portfolioResult.isError) {
    console.error('❌ Error:', portfolioResult.content[0].text);
  } else {
    console.log(portfolioResult.content[0].text);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 2: Update positions
  console.log('📈 Test 2: Updating portfolio positions...');
  const positionsResult = await updateUserPositionsTool.handler({
    userId,
    positions: [
      {
        symbol: 'AAPL',
        quantity: 15,
        averagePrice: 160.0,
        currentPrice: 185.50,
        marketValue: 2782.5,
        totalReturn: 382.5,
        totalReturnPercent: 15.9,
        dayReturn: 45.0,
        dayReturnPercent: 1.6,
      },
      {
        symbol: 'NVDA',
        quantity: 25,
        averagePrice: 220.0,
        currentPrice: 290.00,
        marketValue: 7250.0,
        totalReturn: 1750.0,
        totalReturnPercent: 31.8,
        dayReturn: 125.0,
        dayReturnPercent: 1.8,
      },
      {
        symbol: 'MSFT',
        quantity: 10,
        averagePrice: 350.0,
        currentPrice: 425.00,
        marketValue: 4250.0,
        totalReturn: 750.0,
        totalReturnPercent: 21.4,
        dayReturn: 50.0,
        dayReturnPercent: 1.2,
      },
    ],
  });

  console.log('\n✅ Positions Update Result:');
  if (positionsResult.isError) {
    console.error('❌ Error:', positionsResult.content[0].text);
  } else {
    console.log(positionsResult.content[0].text);
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('✨ All tests completed!\n');
  console.log('💡 These tools are now available to the AI agent through the MCP server.');
  console.log('   The agent can use them to update portfolio data after making trades');
  console.log('   or analyzing market data from Robinhood or other sources.\n');
}

// Run tests
testPortfolioTools().catch(console.error);
