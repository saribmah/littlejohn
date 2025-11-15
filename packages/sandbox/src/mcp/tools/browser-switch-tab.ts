/**
 * Browser Switch Tab Tool
 * Switch the active tab to a different tab
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';


export const browserSwitchTabTool = tool(
  'browser-switch-tab',
  "Switch the active tab to a different tab. " +
    "The active tab is used by default for browser-navigate and browser-info when no tabId is specified. " +
    "Use browser-list-tabs to see available tab IDs.",
  {
    tabId: z.string().describe("The ID of the tab to switch to. Get this from browser-list-tabs."),
  },
  async (args) => {
    try {
      await BrowserTabs.switchTab(args.tabId);

      // Get the tab info
      const tab = await BrowserTabs.getTab(args.tabId);
      if (!tab) {
        throw new Error("Failed to get tab info after switching");
      }

      const output =
        `Successfully switched to tab:\n\n` +
        `Tab ID: ${tab.id}\n` +
        `URL: ${tab.url}\n` +
        `Title: ${tab.title}\n\n` +
        `This tab is now the active tab. All browser operations (navigate, get-info) ` +
        `will target this tab by default unless a different tabId is specified.`;

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

