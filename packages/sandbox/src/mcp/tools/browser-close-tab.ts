/**
 * Browser Close Tab Tool
 * Close a specific tab in the browser session
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';

let currentSessionID = 'default';

export const browserCloseTabTool = tool(
  'browser-close-tab',
  "Close a specific tab in the browser session. " +
    "The tab will be closed and its resources will be cleaned up. " +
    "If you close the active tab, another tab will automatically become active. " +
    "Note: You cannot close the last remaining tab - at least one tab must stay open.",
  {
    tabId: z.string().describe("The ID of the tab to close. Get this from browser-list-tabs."),
  },
  async (args) => {
    try {
      // Get tab info before closing
      const tab = await BrowserTabs.getTab(currentSessionID, args.tabId);
      if (!tab) {
        throw new Error(`Tab ${args.tabId} not found`);
      }

      const tabInfo = {
        id: tab.id,
        url: tab.url,
        title: tab.title,
      };

      // Close the tab
      await BrowserTabs.closeTab(currentSessionID, args.tabId);

      // Get the new active tab
      const activeTabId = await BrowserTabs.getActiveTabId(currentSessionID);
      const remainingTabs = await BrowserTabs.listTabs(currentSessionID);

      const output =
        `Successfully closed tab:\n\n` +
        `Closed Tab ID: ${tabInfo.id}\n` +
        `URL: ${tabInfo.url}\n` +
        `Title: ${tabInfo.title}\n\n` +
        `Remaining tabs: ${remainingTabs.length}\n` +
        (activeTabId ? `Active tab is now: ${activeTabId}\n\n` : "\n") +
        `Use browser-list-tabs to see all remaining tabs.`;

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

export function setSessionID(sessionID: string) {
  currentSessionID = sessionID;
}
