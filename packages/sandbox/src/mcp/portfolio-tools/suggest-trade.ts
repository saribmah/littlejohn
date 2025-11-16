/**
 * Suggest Trade Tool
 * Suggests a trade by adding it to the database for the user to review
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { backendClient } from '../../clients';

export const suggestTradeTool = tool(
  'suggest-trade',
  'Suggest a trade by adding it to the user\'s trade queue. ' +
    'This tool allows you to recommend BUY or SELL actions based on portfolio analysis. ' +
    'The trade will be created with PENDING status for the user to review and approve. ' +
    'Use this after analyzing the portfolio to suggest specific trades.',
  {
    userId: z.string().describe('The user ID to suggest the trade for'),
    symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, TSLA)'),
    amount: z.number().positive().describe('Number of shares to trade'),
    action: z.enum(['BUY', 'SELL']).describe('Trade action: BUY or SELL'),
    price: z.number().positive().optional().describe('Target price per share (optional)'),
    note: z.string().optional().describe('Explanation/reasoning for the trade suggestion'),
  },
  async (args) => {
    try {
      // Calculate total if price is provided
      const total = args.price ? args.price * args.amount : undefined;

      const tradeData = {
        symbol: args.symbol.toUpperCase(),
        amount: args.amount,
        action: args.action,
        status: 'PENDING' as const,
        price: args.price,
        total,
        note: args.note || `AI suggested ${args.action} based on portfolio analysis`,
      };

      const result = await backendClient.createTrade(args.userId, tradeData);

      const output =
        `Successfully suggested trade for user ${args.userId}\n\n` +
        `Trade Suggestion:\n` +
        `  Action: ${args.action}\n` +
        `  Symbol: ${args.symbol.toUpperCase()}\n` +
        `  Amount: ${args.amount} shares\n` +
        (args.price ? `  Target Price: $${args.price.toFixed(2)}\n` : '') +
        (total ? `  Total Value: $${total.toFixed(2)}\n` : '') +
        `  Status: PENDING (awaiting user approval)\n` +
        (args.note ? `\nReasoning: ${args.note}\n` : '') +
        `\nThe trade has been added to the user's queue and is pending their review.`;

      return {
        content: [
          {
            type: 'text' as const,
            text: output
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error suggesting trade: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);
