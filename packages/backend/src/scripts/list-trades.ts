/**
 * List Trades
 * Display all trades in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTrades() {
  console.log('📊 Fetching all trades...\n');

  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (trades.length === 0) {
    console.log('No trades found.');
    return;
  }

  console.log(`Found ${trades.length} trades:\n`);
  console.log('─'.repeat(100));

  trades.forEach((trade, index) => {
    const actionColor = trade.action === 'BUY' ? '\x1b[32m' : '\x1b[31m';
    const statusColor =
      trade.status === 'COMPLETED' ? '\x1b[32m' :
      trade.status === 'PENDING' ? '\x1b[33m' :
      trade.status === 'CANCELLED' ? '\x1b[90m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${index + 1}. ${actionColor}${trade.action}${reset} ${trade.symbol} - ${statusColor}${trade.status}${reset}`);
    console.log(`   Amount: ${trade.amount} shares @ $${trade.price?.toFixed(2) || 'N/A'}`);
    console.log(`   Total: $${trade.total?.toFixed(2) || 'N/A'}`);
    console.log(`   User: ${trade.user.email}`);
    console.log(`   Created: ${trade.createdAt.toLocaleString()}`);
    if (trade.note) {
      console.log(`   Note: ${trade.note}`);
    }
    console.log('─'.repeat(100));
  });
}

listTrades()
  .catch((error) => {
    console.error('❌ Error listing trades:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
