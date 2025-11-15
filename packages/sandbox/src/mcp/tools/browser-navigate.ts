/**
 * Browser Navigate Tool
 * Navigate to a URL in the browser
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';

let currentSessionID = 'default';

export const browserNavigateTool = tool(
  'browser-navigate',
  "Navigate to a URL in the browser. " +
    "Use this ONLY when the user provides an explicit URL or when navigating to a homepage to start a search workflow. " +
    "DO NOT construct URLs from knowledge (e.g., don't navigate to '/wiki/Topic' when asked to search for Topic). " +
    "When the user says 'look up' or 'search for' something, navigate to the site's homepage first, then use the search UI. " +
    "By default, navigates in the active tab. You can optionally specify a tabId to navigate in a specific tab. " +
    "This will load the page and wait for it to finish loading.",
  {
    url: z.string().url().describe("The URL to navigate to. Must be a valid HTTP/HTTPS URL"),
    tabId: z
      .string()
      .optional()
      .describe("Optional tab ID to navigate in. If not provided, uses the active tab. Get tab IDs from browser-list-tabs."),
    waitUntil: z
      .enum(["load", "domcontentloaded", "networkidle"])
      .optional()
      .default("load")
      .describe(
        "Wait until this event: 'load' (page fully loaded), 'domcontentloaded' (DOM ready), " +
        "'networkidle' (no network requests for 500ms). Defaults to 'load'"
      ),
    timeout: z
      .number()
      .optional()
      .default(30000)
      .describe("Navigation timeout in milliseconds. Defaults to 30000 (30 seconds)"),
  },
  async (args) => {
    try {
      const timeout = args.timeout ?? 30000;
      const waitUntil = args.waitUntil ?? "load";
      
      // Get the tab to navigate in
      const tab = args.tabId
        ? await BrowserTabs.getTab(currentSessionID, args.tabId)
        : await BrowserTabs.getTab(currentSessionID); // Gets active tab

      if (!tab) {
        throw new Error(
          args.tabId
            ? `Tab ${args.tabId} not found. Use browser-list-tabs to see available tabs.`
            : "No active tab found. Use browser-list-tabs to see available tabs and browser-switch-tab to set an active tab."
        );
      }

      const { Page } = tab.cdp;

      // Set up navigation promise using CDP's event system
      const navigationPromise = new Promise<void>((resolve, reject) => {
        const tout = setTimeout(() => {
          reject(new Error(`Navigation timeout after ${timeout}ms`));
        }, timeout);

        const handleLoad = () => {
          clearTimeout(tout);
          resolve();
        };

        if (waitUntil === "load") {
          Page.loadEventFired(handleLoad);
        } else if (waitUntil === "domcontentloaded") {
          Page.domContentEventFired(handleLoad);
        } else {
          // For networkidle, wait for load event then additional 500ms of no network activity
          Page.loadEventFired(() => {
            setTimeout(() => {
              clearTimeout(tout);
              resolve();
            }, 500);
          });
        }
      });

      // Start navigation
      await Page.navigate({ url: args.url });

      // Wait for load event
      await navigationPromise;

      // Get final URL (may have redirected)
      const result = await tab.cdp.Runtime.evaluate({
        expression: "window.location.href",
      });

      const finalUrl = result.result.value as string;

      // Update tab info
      tab.url = finalUrl;

      const output =
        `Successfully navigated to: ${args.url}\n` +
        `Final URL: ${finalUrl}\n` +
        `Tab ID: ${tab.id}\n` +
        `Wait strategy: ${waitUntil}\n\n` +
        `The page has loaded and is ready for interaction. You can now use other browser tools ` +
        `like browser-info to inspect the page.`;

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
