/**
 * Get Robinhood Text Code Tool
 * Retrieves the 2FA code from the backend with retry logic
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { backendClient } from '../../clients/backend';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 10000; // 1 minute

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getRobinhoodTextCodeTool = tool(
  'get-robinhood-text-code',
  'Get the Robinhood 2FA text code for the user. ' +
  'If no 2FA code is configured, this will retry up to 3 times (every 1 minute) to allow the user time to add it. ' +
  'The user should add their 2FA code through the dashboard while this is waiting. ' +
  'Use the "use" parameter to mark the code as consumed after retrieving it.',
  {
    userId: z.string().describe('The user ID to get the 2FA code for'),
    use: z.boolean().optional().describe('If true, marks the 2FA code as used after retrieving it. Default: false'),
  },
  async (args) => {
    try {
      const { userId, use = false } = args;
      let attempts = 0;

      while (attempts < MAX_RETRIES) {
        attempts++;

        console.log(`Attempt ${attempts}/${MAX_RETRIES}: Fetching 2FA code for user ${userId} (use=${use})`);

        try {
          // Only mark as used on successful retrieval (final attempt or when code is found)
          const shouldMarkAsUsed = use && attempts === 1; // Mark as used only on first successful retrieval
          const result = await backendClient.get2FACode(userId, shouldMarkAsUsed);

          if (result.code && result.enabled) {
            // Success - we have a 2FA code
            const usedStatus = shouldMarkAsUsed ? ' (marked as used)' : '';
            const output =
              `2FA Code Retrieved${usedStatus}\n\n` +
              `Code: ${result.code}\n\n` +
              `Use this code to complete the 2FA verification on Robinhood.`;

            return {
              content: [
                {
                  type: 'text' as const,
                  text: output
                }
              ]
            };
          }

          // No code found
          if (attempts < MAX_RETRIES) {
            const output =
              `No 2FA code found (Attempt ${attempts}/${MAX_RETRIES})\n\n` +
              `Waiting 1 minute for user to add their 2FA code...\n` +
              `The user should add their 2FA backup code in the dashboard.\n\n` +
              `Retrying in 60 seconds...`;

            console.log(output);

            // Wait 1 minute before retrying
            await sleep(RETRY_DELAY_MS);
          } else {
            // Final attempt failed
            throw new Error(
              'No 2FA code configured after 3 attempts. ' +
              'Please ask the user to add their Robinhood 2FA backup code in the dashboard.'
            );
          }

        } catch (error) {
          if (attempts >= MAX_RETRIES) {
            throw error;
          }

          console.error(`Error fetching 2FA code (attempt ${attempts}):`, error);

          // Wait before retrying on error
          if (attempts < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS);
          }
        }
      }

      // This should not be reached, but just in case
      throw new Error('Failed to retrieve 2FA code after maximum retries');

    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}\n\n` +
                  `The user needs to add their Robinhood 2FA backup code in the dashboard before automated login can work.`
          }
        ],
        isError: true
      };
    }
  }
);
