/**
 * Example usage of the Backend Client
 * This shows how to interact with the backend from the sandbox
 */

import { backendClient } from '../src/clients';

async function main() {
  // Replace with actual user ID from your database
  const userId = 'your-user-id-here';

  console.log('🔌 Backend Client Example\n');

  try {
    // 1. Get portfolio performance
    console.log('📊 Fetching portfolio performance...');
    const performance = await backendClient.getPortfolioPerformance(userId);
    console.log('Portfolio performance:', performance);
    console.log('');

    // 2. Get positions
    console.log('📈 Fetching positions...');
    const positionsData = await backendClient.getPositions(userId);
    console.log('Positions:', positionsData);
    console.log('');

    // 3. Update portfolio
    console.log('💰 Updating portfolio...');
    const portfolioUpdate = await backendClient.updatePortfolio(userId, {
      currentValue: 47234,
      dayChangeValue: 2456,
      dayChangePercentage: 5.5,
      weekChangeValue: 3200,
      weekChangePercentage: 7.2,
      monthChangeValue: 5000,
      monthChangePercentage: 11.8,
      threeMonthChangeValue: 8000,
      threeMonthChangePercentage: 20.4,
      yearChangeValue: 10000,
      yearChangePercentage: 23.5,
    });
    console.log('Portfolio updated:', portfolioUpdate);
    console.log('');

    // 4. Update positions
    console.log('🎯 Updating positions...');
    const positionsUpdate = await backendClient.updatePositions(userId, [
      {
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
        currentPrice: 182.45,
        marketValue: 1824.5,
        totalReturn: 319.5,
        totalReturnPercent: 21.2,
        dayReturn: 25.5,
        dayReturnPercent: 1.4,
      },
      {
        symbol: 'GOOGL',
        quantity: 5,
        averagePrice: 120.0,
        currentPrice: 139.87,
        marketValue: 699.35,
        totalReturn: 99.35,
        totalReturnPercent: 16.6,
        dayReturn: 15.0,
        dayReturnPercent: 2.2,
      },
      {
        symbol: 'MSFT',
        quantity: 8,
        averagePrice: 300.0,
        currentPrice: 425.12,
        marketValue: 3400.96,
        totalReturn: 1000.96,
        totalReturnPercent: 41.7,
        dayReturn: 50.0,
        dayReturnPercent: 1.5,
      },
    ]);
    console.log('Positions updated:', positionsUpdate);
    console.log('');

    console.log('✅ All operations completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
main();
