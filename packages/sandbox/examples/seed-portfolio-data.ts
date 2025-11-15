/**
 * Seed some test portfolio data
 */

import { backendClient } from '../src/clients';

async function seedData() {
  const userId = '1qAMfQi7bvqBRIHGi9Da1HVzXdZXW4aU'; // sarib@gmail.com

  console.log('📝 Seeding portfolio data for user:', userId);

  // 1. Create portfolio performance data
  console.log('\n💰 Creating portfolio...');
  await backendClient.updatePortfolio(userId, {
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
  console.log('✅ Portfolio created');

  // 2. Create positions
  console.log('\n📊 Creating positions...');
  await backendClient.updatePositions(userId, [
    {
      symbol: 'AAPL',
      quantity: 10,
      averagePrice: 150.5,
      currentPrice: 182.45,
      marketValue: 13248,
      totalReturn: 319.5,
      totalReturnPercent: 21.2,
      dayReturn: 25.5,
      dayReturnPercent: 1.4,
    },
    {
      symbol: 'MSFT',
      quantity: 8,
      averagePrice: 300.0,
      currentPrice: 425.12,
      marketValue: 10393,
      totalReturn: 1000.96,
      totalReturnPercent: 41.7,
      dayReturn: 50.0,
      dayReturnPercent: 1.5,
    },
    {
      symbol: 'GOOGL',
      quantity: 15,
      averagePrice: 120.0,
      currentPrice: 139.87,
      marketValue: 8502,
      totalReturn: 298.05,
      totalReturnPercent: 16.6,
      dayReturn: 30.0,
      dayReturnPercent: 2.2,
    },
    {
      symbol: 'TSLA',
      quantity: 12,
      averagePrice: 200.0,
      currentPrice: 242.12,
      marketValue: 7085,
      totalReturn: 505.44,
      totalReturnPercent: 21.1,
      dayReturn: 36.0,
      dayReturnPercent: 1.5,
    },
    {
      symbol: 'NVDA',
      quantity: 20,
      averagePrice: 180.0,
      currentPrice: 283.34,
      marketValue: 5668,
      totalReturn: 2066.8,
      totalReturnPercent: 57.4,
      dayReturn: 100.0,
      dayReturnPercent: 1.8,
    },
  ]);
  console.log('✅ Positions created');

  console.log('\n✨ All data seeded successfully!');
}

seedData().catch(console.error);
