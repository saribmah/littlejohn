/**
 * Update User Positions Tool
 * Updates the user's portfolio positions in the backend
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { backendClient } from '../../clients';

const positionSchema = z.object({
  symbol: z.string().describe('Stock symbol (e.g., AAPL, GOOGL, MSFT)'),
  quantity: z.number().describe('Number of shares held'),
  averagePrice: z.number().describe('Average purchase price per share'),
  currentPrice: z.number().describe('Current market price per share'),
  marketValue: z.number().describe('Total market value (quantity × currentPrice)'),
  totalReturn: z.number().describe('Total return in dollars (can be negative)'),
  totalReturnPercent: z.number().describe('Total return as a percentage (can be negative)'),
  dayReturn: z.number().describe('Day return in dollars (can be negative)'),
  dayReturnPercent: z.number().describe('Day return as a percentage (can be negative)'),
});

export const updateUserPositionsTool = tool(
  'update-user-positions',
  'Update the user\'s portfolio positions. ' +
    'This tool allows you to set all positions for a user\'s portfolio. ' +
    'Pass an array of positions with stock symbols, quantities, prices, and returns. ' +
    'This will replace all existing positions with the new data. ' +
    'Use this after making trades or when syncing portfolio state from a brokerage.',
  {
    userId: z.string().describe('The user ID to update positions for'),
    positions: z.array(positionSchema).describe('Array of position objects to set for the user'),
  },
  async (args) => {
    try {
      // Validate that we have positions
      if (args.positions.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'No positions provided. At least one position is required.'
            }
          ],
          isError: true
        };
      }

      const result = await backendClient.updatePositions(args.userId, args.positions);

      // Calculate total portfolio value
      const totalValue = args.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const totalReturn = args.positions.reduce((sum, pos) => sum + pos.totalReturn, 0);

      const output =
        `Successfully updated ${args.positions.length} position(s) for user ${args.userId}\n\n` +
        `Positions:\n` +
        args.positions.map((pos, idx) =>
          `  ${idx + 1}. ${pos.symbol}\n` +
          `     Quantity: ${pos.quantity} shares\n` +
          `     Current Price: $${pos.currentPrice.toFixed(2)}\n` +
          `     Market Value: $${pos.marketValue.toFixed(2)}\n` +
          `     Total Return: $${pos.totalReturn.toFixed(2)} (${pos.totalReturnPercent.toFixed(2)}%)\n`
        ).join('\n') +
        `\nPortfolio Summary:\n` +
        `  Total Value: $${totalValue.toFixed(2)}\n` +
        `  Total Return: $${totalReturn.toFixed(2)}\n` +
        `\nAll positions have been successfully updated in the backend.`;

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
            text: `Error updating positions: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);
