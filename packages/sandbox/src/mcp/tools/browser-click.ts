/**
 * Browser Click Tool
 * Click an element on the page using a snapshot ID and element ID
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';
import { SnapshotStorage } from '../../browser/snapshot-storage';
import { Resolver } from '../../browser/resolver';

export const browserClickTool = tool(
  'browser-click',
  "Click an element on the page using a snapshot ID and element ID. " +
    "You must call browser-get-dom-snapshot first to get the snapshot ID and identify elements. " +
    "The element is resolved at action time using robust locators, so it works even if the page has changed slightly. " +
    "If resolution fails or confidence is low, you may need to get a fresh snapshot.",
  {
    snapshotId: z
      .string()
      .describe("The snapshot ID from browser-get-dom-snapshot output (e.g., 'snap_1234567890_abc123')."),

    snapId: z
      .string()
      .describe("The element snapId from the snapshot (e.g., '0', '1', '2'). Get this from browser-get-dom-snapshot output."),

    tabId: z
      .string()
      .optional()
      .describe("Optional tab ID. If not provided, uses the active tab."),

    waitForNavigation: z
      .boolean()
      .optional()
      .default(false)
      .describe("Wait for page navigation after clicking. Useful for links and submit buttons. Default: false"),

    waitTime: z
      .number()
      .optional()
      .default(1000)
      .describe("Milliseconds to wait after clicking. Default: 1000ms"),
  },
  async (args) => {
    try {
      // Get the tab to interact with
      const tab = args.tabId
        ? await BrowserTabs.getTab(args.tabId)
        : await BrowserTabs.getTab();

      if (!tab) {
        throw new Error(
          args.tabId
            ? `Tab ${args.tabId} not found. Use browser-list-tabs to see available tabs.`
            : "No active tab found. Use browser-list-tabs to see available tabs and browser-switch-tab to set an active tab."
        );
      }

      // Get snapshot element
      const element = SnapshotStorage.getElement(args.snapshotId, args.snapId);
      if (!element) {
        throw new Error(
          `Element not found in snapshot. ` +
          `Snapshot ID: ${args.snapshotId}, Element ID: ${args.snapId}. ` +
          `Make sure you're using the correct IDs from browser-get-dom-snapshot output.`
        );
      }

      // Resolve element using locator bundle
      const resolution = await Resolver.resolve(tab.cdp, {
        locators: element.locators,
        minConfidence: 0.75,
      });

      if (!resolution.success) {
        throw new Error(
          `Failed to resolve element [${args.snapId}]. ` +
          `${resolution.error || 'The page may have changed significantly since the snapshot was taken.'}` +
          `\nTry calling browser-get-dom-snapshot again to get a fresh snapshot.`
        );
      }

      if (resolution.confidence < 0.75) {
        throw new Error(
          `Element resolution confidence too low (${resolution.confidence.toFixed(2)}). ` +
          `The page may have changed since the snapshot. ` +
          `Try calling browser-get-dom-snapshot again to get a fresh snapshot.`
        );
      }

      // Click the element using full resolver script
      const clickResult = await tab.cdp.Runtime.evaluate({
        expression: `
          (async () => {
            // Run resolution to verify element exists
            const report = await (${Resolver.generateResolutionScript(element.locators, 0.75)});

            if (!report.success) {
              throw new Error('Element resolution failed during click: ' + (report.error || 'Unknown error'));
            }

            // The report confirms the element exists and is visible
            // Now find it again using the same logic and click it
            const locators = ${JSON.stringify(element.locators)};

            // Helper functions (same as in resolver)
            function getRole(el) {
              const explicit = (el.getAttribute('role') || '').toLowerCase();
              if (explicit) return explicit;
              const tag = el.tagName.toLowerCase();
              if (tag === 'a' && el.hasAttribute('href')) return 'link';
              if (tag === 'button') return 'button';
              if (tag === 'input') {
                const type = (el.type || 'text').toLowerCase();
                if (['button', 'submit', 'reset'].includes(type)) return 'button';
                if (['text', 'email', 'search', 'url', 'tel', 'password', 'number'].includes(type)) return 'textbox';
              }
              if (tag === 'textarea') return 'textbox';
              if (tag === 'select') return 'combobox';
              return null;
            }

            function getAccessibleName(el) {
              if (el.hasAttribute('aria-label')) return el.getAttribute('aria-label').trim();
              if (el.hasAttribute('aria-labelledby')) {
                const id = el.getAttribute('aria-labelledby');
                const labelEl = document.getElementById(id);
                if (labelEl) return labelEl.textContent.trim().replace(/\\s+/g, ' ');
              }
              if (el.id) {
                const label = document.querySelector(\`label[for="\${CSS.escape(el.id)}"]\`);
                if (label) return label.textContent.trim().replace(/\\s+/g, ' ');
              }
              return (el.textContent || '').trim().replace(/\\s+/g, ' ').substring(0, 200);
            }

            function isVisible(el) {
              const style = window.getComputedStyle(el);
              return el.offsetParent !== null &&
                     style.display !== 'none' &&
                     style.visibility !== 'hidden' &&
                     parseFloat(style.opacity) > 0;
            }

            // Find element using role + name if available
            let targetElement = null;
            if (locators.role && locators.name) {
              const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
                if (!isVisible(el)) return false;
                const role = getRole(el);
                const name = getAccessibleName(el);
                return role === locators.role && name.toLowerCase() === locators.name.toLowerCase();
              });
              if (candidates.length > 0) targetElement = candidates[0];
            }

            // Try CSS if role+name didn't work
            if (!targetElement && locators.css) {
              const matches = Array.from(document.querySelectorAll(locators.css));
              const visible = matches.filter(isVisible);
              if (visible.length > 0) targetElement = visible[0];
            }

            // Try XPath if CSS didn't work
            if (!targetElement && locators.xpath) {
              try {
                const result = document.evaluate(locators.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                if (result.singleNodeValue && isVisible(result.singleNodeValue)) {
                  targetElement = result.singleNodeValue;
                }
              } catch (e) {}
            }

            if (!targetElement) {
              throw new Error('Could not find element to click after resolution');
            }

            // Scroll into view
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Click
            targetElement.click();

            return {
              tag: targetElement.tagName.toLowerCase(),
              text: (targetElement.textContent || '').trim().substring(0, 100),
              role: getRole(targetElement),
              name: getAccessibleName(targetElement),
            };
          })()
        `,
        returnByValue: true,
        awaitPromise: true,
      });

      if (clickResult.exceptionDetails) {
        const errorMsg = clickResult.exceptionDetails.exception?.description || "Click failed";
        throw new Error(errorMsg);
      }

      const clickInfo = clickResult.result.value as {
        tag: string;
        text: string;
        role: string | null;
        name: string | null;
      };

      // Wait if requested
      if (args.waitForNavigation || args.waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, args.waitTime));
      }

      // Build output message
      let output = `Successfully clicked element [${args.snapId}]:\n`;
      output += `  Tag: <${clickInfo.tag}>\n`;
      if (clickInfo.role) output += `  Role: ${clickInfo.role}\n`;
      if (clickInfo.name) output += `  Name: "${clickInfo.name}"\n`;
      if (clickInfo.text) output += `  Text: "${clickInfo.text}"\n`;
      output += `\nResolution:\n`;
      output += `  Strategy: ${resolution.strategy}\n`;
      output += `  Confidence: ${(resolution.confidence * 100).toFixed(0)}%\n`;

      if (args.waitForNavigation) {
        output += `\nWaited ${args.waitTime}ms for navigation to complete.`;
      }

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
