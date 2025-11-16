/**
 * Get Robinhood Credentials Tool
 * Returns the Robinhood username and password from environment variables
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { config } from '../../config';

export const getRobinhoodCredentialsTool = tool(
  'get-robinhood-credentials',
  'Get the Robinhood account credentials (username and password) to use for logging in. ' +
  'Returns the credentials that should be used to fill in the Robinhood login form.',
  {}, // No input parameters needed
  async () => {
    try {
      const { robinhoodUsername, robinhoodPassword } = config;

      if (!robinhoodUsername || !robinhoodPassword) {
        throw new Error(
          'Robinhood credentials not configured. Please set ROBINHOOD_USERNAME and ROBINHOOD_PASSWORD in .env file.'
        );
      }

      const output =
        `Robinhood Credentials\n\n` +
        `Username: ${robinhoodUsername}\n` +
        `Password: ${robinhoodPassword}\n\n` +
        `Use these credentials to fill in the Robinhood login form.`;

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
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);
