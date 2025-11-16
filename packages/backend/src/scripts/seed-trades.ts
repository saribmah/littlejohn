/**
 * Seed Sample Trades
 * Creates sample trades for testing
 */

import { PrismaClient, TradeAction, TradeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTrades() {
  console.log('🌱 Seeding sample trades...');

  // Get the first user (or specify a user ID)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('❌ No user found. Please create a user first.');
    process.exit(1);
  }

  console.log(`📝 Creating trades for user: ${user.email}`);

  // Create sample trades
  const trades = [
    {
      userId: user.id,
      symbol: 'AAPL',
      amount: 10,
      action: TradeAction.BUY,
      status: TradeStatus.PENDING,
      price: 185.50,
      total: 1855.00,
      note: 'Buy Apple stock',
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      userId: user.id,
      symbol: 'TSLA',
      amount: 5,
      action: TradeAction.SELL,
      status: TradeStatus.COMPLETED,
      price: 250.00,
      total: 1250.00,
      note: 'Sell Tesla shares',
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: user.id,
      symbol: 'NVDA',
      amount: 8,
      action: TradeAction.BUY,
      status: TradeStatus.COMPLETED,
      price: 490.00,
      total: 3920.00,
      note: 'Buy NVIDIA',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      userId: user.id,
      symbol: 'GOOGL',
      amount: 15,
      action: TradeAction.BUY,
      status: TradeStatus.CANCELLED,
      price: 140.00,
      total: 2100.00,
      note: 'Buy Google - Cancelled due to market conditions',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      userId: user.id,
      symbol: 'MSFT',
      amount: 12,
      action: TradeAction.BUY,
      status: TradeStatus.COMPLETED,
      price: 370.00,
      total: 4440.00,
      note: 'Buy Microsoft',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: user.id,
      symbol: 'AMZN',
      amount: 20,
      action: TradeAction.SELL,
      status: TradeStatus.PENDING,
      price: 145.00,
      total: 2900.00,
      note: 'Sell Amazon shares',
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      userId: user.id,
      symbol: 'META',
      amount: 7,
      action: TradeAction.BUY,
      status: TradeStatus.FAILED,
      price: 380.00,
      total: 2660.00,
      note: 'Buy Meta - Failed due to insufficient funds',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: user.id,
      symbol: 'AMD',
      amount: 25,
      action: TradeAction.BUY,
      status: TradeStatus.COMPLETED,
      price: 120.00,
      total: 3000.00,
      note: 'Buy AMD',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  // Insert trades
  for (const trade of trades) {
    await prisma.trade.create({
      data: trade,
    });
    console.log(`✅ Created ${trade.action} ${trade.symbol} - ${trade.status}`);
  }

  console.log(`\n🎉 Successfully created ${trades.length} sample trades!`);
}

seedTrades()
  .catch((error) => {
    console.error('❌ Error seeding trades:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
