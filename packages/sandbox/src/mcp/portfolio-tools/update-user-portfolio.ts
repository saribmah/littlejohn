/**
 * Update User Portfolio Tool
 * Updates the user's portfolio performance data in the backend
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { backendClient } from '../../clients';

export const updateUserPortfolioTool = tool(
  'update-user-portfolio',
  'Update the user\'s portfolio performance data. ' +
    'This tool allows you to update portfolio metrics including current value, ' +
    'day/week/month/year changes in both absolute value and percentage. ' +
    'Use this after analyzing portfolio data or making trades to keep the portfolio state current.',
  {
    userId: z.string().describe('The user ID to update portfolio for'),
    currentValue: z.number().describe('Current total portfolio value in dollars'),
    dayChangeValue: z.number().describe('Day change in dollars (can be negative)'),
    dayChangePercentage: z.number().describe('Day change as a percentage (can be negative)'),
    weekChangeValue: z.number().optional().describe('Week change in dollars (optional)'),
    weekChangePercentage: z.number().optional().describe('Week change as a percentage (optional)'),
    monthChangeValue: z.number().optional().describe('Month change in dollars (optional)'),
    monthChangePercentage: z.number().optional().describe('Month change as a percentage (optional)'),
    threeMonthChangeValue: z.number().optional().describe('3-month change in dollars (optional)'),
    threeMonthChangePercentage: z.number().optional().describe('3-month change as a percentage (optional)'),
    yearChangeValue: z.number().optional().describe('Year change in dollars (optional)'),
    yearChangePercentage: z.number().optional().describe('Year change as a percentage (optional)'),
  },
  async (args) => {
    try {
      const portfolioData = {
        currentValue: args.currentValue,
        dayChangeValue: args.dayChangeValue,
        dayChangePercentage: args.dayChangePercentage,
        weekChangeValue: args.weekChangeValue ?? 0,
        weekChangePercentage: args.weekChangePercentage ?? 0,
        monthChangeValue: args.monthChangeValue ?? 0,
        monthChangePercentage: args.monthChangePercentage ?? 0,
        threeMonthChangeValue: args.threeMonthChangeValue ?? 0,
        threeMonthChangePercentage: args.threeMonthChangePercentage ?? 0,
        yearChangeValue: args.yearChangeValue ?? 0,
        yearChangePercentage: args.yearChangePercentage ?? 0,
      };

      const result = await backendClient.updatePortfolio(args.userId, portfolioData);

      const output =
        `Successfully updated portfolio for user ${args.userId}\n\n` +
        `Portfolio Summary:\n` +
        `  Current Value: $${args.currentValue.toFixed(2)}\n` +
        `  Day Change: $${args.dayChangeValue.toFixed(2)} (${args.dayChangePercentage.toFixed(2)}%)\n` +
        (args.weekChangeValue ? `  Week Change: $${args.weekChangeValue.toFixed(2)} (${args.weekChangePercentage?.toFixed(2)}%)\n` : '') +
        (args.monthChangeValue ? `  Month Change: $${args.monthChangeValue.toFixed(2)} (${args.monthChangePercentage?.toFixed(2)}%)\n` : '') +
        (args.yearChangeValue ? `  Year Change: $${args.yearChangeValue.toFixed(2)} (${args.yearChangePercentage?.toFixed(2)}%)\n` : '') +
        `\nThe portfolio has been successfully updated in the backend.`;

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
            text: `Error updating portfolio: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);
