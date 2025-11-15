/**
 * Browser Info Tool (Unified Version)
 * Get information about a page in the browser
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';

export const browserInfoTool = tool(
  'browser-info',
  'Get information about a page in the browser. ' +
  'Returns the current URL, page title, ready state, and viewport dimensions. ' +
  'Useful for understanding the current browser state before taking actions.',
  {
    tabId: z
      .string()
      .optional()
      .describe('Optional tab ID to get info from. If not provided, uses the active tab.'),
  },
  async (args) => {
    try {
      // Get the tab to get info from
      const tab = args.tabId
        ? await BrowserTabs.getTab(args.tabId)
        : await BrowserTabs.getTab(); // Gets active tab or creates one

      if (!tab) {
        throw new Error(
          args.tabId
            ? `Tab ${args.tabId} not found.`
            : 'No active tab found.'
        );
      }

      // Get page information using CDP
      const result = await tab.cdp.Runtime.evaluate({
        expression: `
          JSON.stringify({
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              scrollHeight: document.documentElement.scrollHeight,
              scrollWidth: document.documentElement.scrollWidth
            }
          })
        `,
        returnByValue: true,
      });

      const info = JSON.parse(result.result.value as string);

      // Update tab info
      tab.url = info.url;
      tab.title = info.title;

      const output =
        `Page Information\n\n` +
        `Tab ID: ${tab.id}\n` +
        `URL: ${info.url}\n` +
        `Title: ${info.title}\n` +
        `Ready State: ${info.readyState}\n\n` +
        `Viewport:\n` +
        `  Dimensions: ${info.viewport.width}x${info.viewport.height}\n` +
        `  Scroll Position: (${info.viewport.scrollX}, ${info.viewport.scrollY})\n` +
        `  Total Size: ${info.viewport.scrollWidth}x${info.viewport.scrollHeight}\n\n` +
        `The page is ${info.readyState === 'complete' ? 'fully loaded' : 'still loading'}. ` +
        `${info.viewport.scrollHeight > info.viewport.height ? 'The page is scrollable.' : 'The page fits in the viewport.'}`;

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
