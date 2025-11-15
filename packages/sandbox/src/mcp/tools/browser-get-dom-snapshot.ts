/**
 * Browser Get DOM Snapshot Tool
 * Get a downsampled snapshot of the page DOM optimized for AI understanding
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';
import { DOMSampler } from '../../browser/dom-sampler';
import { Extractor } from '../../browser/extractor';
import { SnapshotStorage } from '../../browser/snapshot-storage';

let currentSessionID = 'default';

/**
 * Calculate smart default token limit based on estimated page size
 */
function calculateSmartTokenLimit(estimatedTokens: number): number {
  if (estimatedTokens < 5000) return 4096;      // Simple pages
  if (estimatedTokens < 20000) return 8192;     // Medium complexity
  if (estimatedTokens < 50000) return 16384;    // Complex pages (most e-commerce)
  if (estimatedTokens < 150000) return 32768;   // Very complex pages (news, docs)
  if (estimatedTokens < 400000) return 65536;   // Extremely complex (Wikipedia, academic)
  return 131072;                                // Maximum complexity (handle edge cases)
}

export const browserGetDOMSnapshotTool = tool(
  'browser-get-dom-snapshot',
  "Get a downsampled snapshot of the page DOM optimized for AI understanding. " +
    "This provides a token-efficient representation while preserving page structure and interactive elements. " +
    "Elements are identified by snapId for interaction. The snapshot DOES NOT modify the live page. " +
    "Use this to understand page structure before interacting with elements.",
  {
    tabId: z
      .string()
      .optional()
      .describe("Optional tab ID. If not provided, uses the active tab."),

    maxTokens: z
      .number()
      .optional()
      .describe("Maximum token count for snapshot. If not provided, automatically calculated based on page complexity (4K-32K range). Only override if you need very precise control."),

    maxIterations: z
      .number()
      .optional()
      .default(5)
      .describe("Maximum iterations for adaptive downsampling. Default: 5. More iterations = better optimization but slower."),

    selector: z
      .string()
      .optional()
      .describe("Optional CSS selector to snapshot a specific element instead of full page. Example: 'main', '#content', '.container'"),

    filterHidden: z
      .boolean()
      .optional()
      .default(true)
      .describe("Filter out hidden elements (display:none, visibility:hidden). Default: true"),
  },
  async (args) => {
    try {
      // Get the tab to extract DOM from
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

      // Get current page URL
      const urlResult = await tab.cdp.Runtime.evaluate({
        expression: "window.location.href",
        returnByValue: true,
      });
      const url = urlResult.result.value as string;

      // Extract interactive elements using the new extractor
      // This does NOT mutate the live DOM
      const extraction = await Extractor.extract(tab.cdp, "main");

      // Get DOM HTML via CDP
      const htmlResult = await tab.cdp.Runtime.evaluate({
        expression: args.selector
          ? `
            (() => {
              const el = document.querySelector('${args.selector.replace(/'/g, "\\'")}');
              return el ? el.outerHTML : '';
            })()
          `
          : "document.documentElement.outerHTML",
        returnByValue: true,
      });

      const html = htmlResult.result.value as string;
      if (!html) {
        throw new Error(
          args.selector
            ? `Element not found: ${args.selector}. Make sure the selector is valid and the element exists.`
            : "Failed to extract DOM. The page might not be loaded yet."
        );
      }

      // Apply D2Snap downsampling with extracted elements
      // Calculate smart default token limit based on page size
      const estimatedTokens = Math.ceil(html.length / 4);
      const smartMaxTokens = args.maxTokens ?? calculateSmartTokenLimit(estimatedTokens);

      // Implement adaptive token threshold with auto-retry
      let samplerResult: Awaited<ReturnType<typeof DOMSampler.sample>> | undefined;
      let currentMaxTokens = smartMaxTokens;
      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          samplerResult = await DOMSampler.sample({
            html,
            elements: extraction.elements,
            maxTokens: currentMaxTokens,
            maxIterations: args.maxIterations,
            filterHidden: args.filterHidden,
          });
          break; // Success, exit loop
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("token threshold")) {
            attempt++;
            if (attempt < maxRetries) {
              currentMaxTokens *= 2; // Double the token limit
              console.warn(
                `DOM snapshot failed with maxTokens=${currentMaxTokens / 2}. Retrying with ${currentMaxTokens} tokens (attempt ${attempt}/${maxRetries})`
              );
              continue;
            } else {
              throw new Error(
                `Failed to create DOM snapshot after ${maxRetries} attempts. ` +
                  `The page is extremely complex (estimated ${Math.ceil(html.length / 4)} tokens). ` +
                  `Try using the 'selector' parameter to focus on a specific region (e.g., selector: 'header', selector: '#content').`
              );
            }
          } else {
            throw error; // Re-throw non-threshold errors
          }
        }
      }

      // Ensure samplerResult is defined (TypeScript safety)
      if (!samplerResult) {
        throw new Error("Failed to create DOM snapshot: unexpected error in retry loop");
      }

      // Create snapshot and store it
      const snapshot: SnapshotStorage.Snapshot = {
        snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        url,
        frameId: extraction.frameId,
        createdAt: Date.now(),
        html: samplerResult.html,
        elements: samplerResult.elements,
        meta: {
          tokenCount: samplerResult.tokenCount,
          elementCount: samplerResult.elementCount,
          reductionPercent: samplerResult.reductionPercent,
        },
      };

      // Store snapshot for later use by action tools
      SnapshotStorage.store(currentSessionID, snapshot);

      // Format element list for output
      const elementList = snapshot.elements
        .slice(0, 50) // Show first 50 elements
        .map((el) => {
          const attrs = [];
          if (el.locators.attrs.type) attrs.push(`type="${el.locators.attrs.type}"`);
          if (el.locators.attrs.name) attrs.push(`name="${el.locators.attrs.name}"`);
          if (el.locators.attrs.placeholder) attrs.push(`placeholder="${el.locators.attrs.placeholder}"`);
          if (el.locators.attrs.href) attrs.push(`href="${el.locators.attrs.href}"`);
          if (el.locators.role) attrs.push(`role="${el.locators.role}"`);

          const attrStr = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
          const textStr = el.text ? ` "${el.text.substring(0, 50)}${el.text.length > 50 ? "..." : ""}"` : "";

          return `  [${el.snapId}] <${el.tag}${attrStr}>${textStr}`;
        })
        .join("\n");

      const moreElements = snapshot.elements.length > 50
        ? `\n  ... and ${snapshot.elements.length - 50} more elements`
        : "";

      const output =
        `DOM Snapshot extracted (${snapshot.meta.tokenCount} tokens, ${snapshot.meta.reductionPercent}% reduction from original):\n\n` +
        `Snapshot ID: ${snapshot.snapshotId}\n` +
        `URL: ${snapshot.url}\n\n` +
        `${snapshot.html}\n\n` +
        `---\n\n` +
        `Found ${snapshot.meta.elementCount} interactive elements:\n${elementList}${moreElements}\n\n` +
        `You can now interact with these elements using their snapId:\n` +
        `- browser-click({ snapshotId: "${snapshot.snapshotId}", snapId: "0" }) - Click an element\n` +
        `- browser-type({ snapshotId: "${snapshot.snapshotId}", snapId: "0", text: "..." }) - Type into input\n` +
        `- browser-select({ snapshotId: "${snapshot.snapshotId}", snapId: "0", value: "..." }) - Select dropdown option\n\n` +
        `Note: The live page has NOT been modified. Elements are resolved at action time using robust locators.`;

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
