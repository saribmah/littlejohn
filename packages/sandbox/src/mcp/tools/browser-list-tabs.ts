/**
 * Browser List Tabs Tool
 * List all open tabs in the browser session
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { BrowserTabs } from '../../browser/tabs';

let currentSessionID = 'default';

export const browserListTabsTool = tool(
  'browser-list-tabs',
  "List all open tabs in the current browser session. " +
    "Shows tab IDs, URLs, titles, and indicates which tab is currently active. " +
    "Use this to see available tabs before switching or closing them.",
  {},
  async (_args) => {
    try {
      const tabs = await BrowserTabs.listTabs(currentSessionID);
      const activeTabId = await BrowserTabs.getActiveTabId(currentSessionID);

      if (tabs.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: "No tabs are currently open in this session."
            }
          ]
        };
      }

      const tabList = tabs
        .map((tab, index) => {
          const isActive = tab.id === activeTabId;
          const activeMarker = isActive ? " ⭐ ACTIVE" : "";
          return (
            `${index + 1}. ${tab.title || "Untitled"}${activeMarker}\n` +
            `   Tab ID: ${tab.id}\n` +
            `   URL: ${tab.url}\n` +
            `   Created: ${new Date(tab.createdAt).toISOString()}`
          );
        })
        .join("\n\n");

      const output =
        `Found ${tabs.length} open tab${tabs.length !== 1 ? "s" : ""}:\n\n` +
        tabList +
        `\n\n` +
        `Use browser-switch-tab to change the active tab or browser-close-tab to close a tab.`;

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
