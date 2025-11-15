/**
 * Browser Create Tab Tool
 * Create a new tab in the browser session
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';


export const browserCreateTabTool = tool(
  'browser-create-tab',
  "Create a new tab in the browser session. " +
    "The new tab will be created and optionally navigated to a URL. " +
    "The tab will not automatically become the active tab - use browser-switch-tab to activate it.",
  {
    url: z
      .string()
      .url()
      .optional()
      .describe("Optional URL to navigate to in the new tab. If not provided, opens about:blank"),
  },
  async (args) => {
    try {
      const tab = await BrowserTabs.createTab({
        sessionID: currentSessionID,
        url: args.url,
      });

      const output =
        `Successfully created new tab:\n\n` +
        `Tab ID: ${tab.id}\n` +
        `URL: ${tab.url}\n` +
        `Title: ${tab.title}\n\n` +
        `The new tab has been created but is not the active tab. ` +
        `Use browser-switch-tab with tabId "${tab.id}" to make it the active tab, ` +
        `or use browser-list-tabs to see all tabs.`;

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

