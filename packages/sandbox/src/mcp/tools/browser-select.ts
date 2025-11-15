/**
 * Browser Select Tool
 * Select options from dropdown elements
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';
import { SnapshotStorage } from '../../browser/snapshot-storage';
import { Resolver } from '../../browser/resolver';

let currentSessionID = 'default';

export const browserSelectTool = tool(
  'browser-select',
  "Select an option from a dropdown (select element) using a snapshot ID and element ID. " +
    "You must call browser-get-dom-snapshot first to get the snapshot ID and identify elements. " +
    "The element is resolved at action time using robust locators. " +
    "The element must be a SELECT element. " +
    "You can select by option value, text, or index.",
  {
    snapshotId: z
      .string()
      .describe("The snapshot ID from browser-get-dom-snapshot output (e.g., 'snap_1234567890_abc123')."),

    snapId: z
      .string()
      .describe("The element snapId from the snapshot (e.g., '0', '1', '2'). Get this from browser-get-dom-snapshot output."),

    value: z
      .string()
      .optional()
      .describe("Select option by its value attribute. Example: 'us' for <option value='us'>United States</option>"),

    text: z
      .string()
      .optional()
      .describe("Select option by its visible text. Example: 'United States' for <option value='us'>United States</option>"),

    index: z
      .number()
      .optional()
      .describe("Select option by its index (0-based). Example: 0 for first option, 1 for second, etc."),

    tabId: z
      .string()
      .optional()
      .describe("Optional tab ID. If not provided, uses the active tab."),
  },
  async (args) => {
    try {
      // Validate: must provide exactly one selection method
      const selectionMethods = [args.value, args.text, args.index !== undefined].filter(Boolean).length;
      if (selectionMethods === 0) {
        throw new Error("Must provide one of: value, text, or index to select an option");
      }
      if (selectionMethods > 1) {
        throw new Error("Provide only ONE of: value, text, or index (not multiple)");
      }

      // Get the tab to interact with
      const tab = args.tabId
        ? await BrowserTabs.getTab(currentSessionID, args.tabId)
        : await BrowserTabs.getTab(currentSessionID);

      if (!tab) {
        throw new Error(
          args.tabId
            ? `Tab ${args.tabId} not found. Use browser-list-tabs to see available tabs.`
            : "No active tab found. Use browser-list-tabs to see available tabs and browser-switch-tab to set an active tab."
        );
      }

      // Get snapshot element
      const element = SnapshotStorage.getElement(currentSessionID, args.snapshotId, args.snapId);
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

      // Select the option
      const result = await tab.cdp.Runtime.evaluate({
        expression: `
        (() => {
          const locators = ${JSON.stringify(element.locators)};

          // Helper functions (same as in resolver)
          function getRole(el) {
            const explicit = (el.getAttribute('role') || '').toLowerCase();
            if (explicit) return explicit;
            const tag = el.tagName.toLowerCase();
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
          let element = null;
          if (locators.role && locators.name) {
            const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
              if (!isVisible(el)) return false;
              const role = getRole(el);
              const name = getAccessibleName(el);
              return role === locators.role && name.toLowerCase() === locators.name.toLowerCase();
            });
            if (candidates.length > 0) element = candidates[0];
          }

          // Try CSS if role+name didn't work
          if (!element && locators.css) {
            const matches = Array.from(document.querySelectorAll(locators.css));
            const visible = matches.filter(isVisible);
            if (visible.length > 0) element = visible[0];
          }

          // Try XPath if CSS didn't work
          if (!element && locators.xpath) {
            try {
              const result = document.evaluate(locators.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              if (result.singleNodeValue && isVisible(result.singleNodeValue)) {
                element = result.singleNodeValue;
              }
            } catch (e) {}
          }

          // Try tag-based search as last resort
          if (!element && locators.tag === 'select') {
            const matches = Array.from(document.querySelectorAll('select'));
            const visible = matches.filter(el => {
              if (!isVisible(el)) return false;
              // For selects, match by name or id if available
              if (locators.attrs.name && el.name === locators.attrs.name) return true;
              if (locators.attrs.id && el.id === locators.attrs.id) return true;
              return false;
            });
            if (visible.length > 0) element = visible[0];
          }

          if (!element) {
            throw new Error('Could not find element after resolution');
          }

          // Check if it's a select element
          if (element.tagName !== 'SELECT') {
            throw new Error(
              'Element is not a select element. ' +
              'Found: <' + element.tagName.toLowerCase() + '>. ' +
              'Only SELECT elements can have options selected.'
            );
          }

          // Check if element is disabled
          if (element.disabled) {
            throw new Error('Element is disabled and cannot be changed.');
          }

          // Get element info before selection
          const valueBefore = element.value;
          const selectedIndexBefore = element.selectedIndex;
          const selectedTextBefore = element.options[selectedIndexBefore]?.text || '';

          // Get all available options for debugging
          const allOptions = Array.from(element.options).map((opt, idx) => ({
            index: idx,
            value: opt.value,
            text: opt.text,
            disabled: opt.disabled,
          }));

          let selectedOption = null;
          let selectionMethod = '';

          // Select by value
          ${args.value !== undefined ? `
          selectionMethod = 'value';
          const targetValue = ${JSON.stringify(args.value)};
          const optionByValue = Array.from(element.options).find(opt => opt.value === targetValue);

          if (!optionByValue) {
            const availableValues = allOptions.map(o => o.value).join(', ');
            throw new Error(
              'No option found with value "' + targetValue + '". ' +
              'Available values: ' + availableValues
            );
          }

          if (optionByValue.disabled) {
            throw new Error('Option with value "' + targetValue + '" is disabled and cannot be selected.');
          }

          element.value = targetValue;
          selectedOption = {
            index: optionByValue.index,
            value: optionByValue.value,
            text: optionByValue.text,
          };
          ` : ''}

          // Select by text
          ${args.text !== undefined ? `
          selectionMethod = 'text';
          const targetText = ${JSON.stringify(args.text)};
          const optionByText = Array.from(element.options).find(opt =>
            opt.text.trim().toLowerCase() === targetText.trim().toLowerCase()
          );

          if (!optionByText) {
            const availableTexts = allOptions.map(o => o.text).join(', ');
            throw new Error(
              'No option found with text "' + targetText + '". ' +
              'Available options: ' + availableTexts
            );
          }

          if (optionByText.disabled) {
            throw new Error('Option with text "' + targetText + '" is disabled and cannot be selected.');
          }

          element.selectedIndex = optionByText.index;
          selectedOption = {
            index: optionByText.index,
            value: optionByText.value,
            text: optionByText.text,
          };
          ` : ''}

          // Select by index
          ${args.index !== undefined ? `
          selectionMethod = 'index';
          const targetIndex = ${args.index};

          if (targetIndex < 0 || targetIndex >= element.options.length) {
            throw new Error(
              'Index ' + targetIndex + ' is out of range. ' +
              'Select has ' + element.options.length + ' options (index 0 to ' + (element.options.length - 1) + ').'
            );
          }

          const optionByIndex = element.options[targetIndex];
          if (optionByIndex.disabled) {
            throw new Error('Option at index ' + targetIndex + ' is disabled and cannot be selected.');
          }

          element.selectedIndex = targetIndex;
          selectedOption = {
            index: targetIndex,
            value: optionByIndex.value,
            text: optionByIndex.text,
          };
          ` : ''}

          // Trigger change event
          element.dispatchEvent(new Event('change', { bubbles: true }));

          return {
            tag: 'select',
            name: element.name || null,
            id: element.id || null,
            selectionMethod,
            before: {
              value: valueBefore,
              index: selectedIndexBefore,
              text: selectedTextBefore,
            },
            after: selectedOption,
            totalOptions: element.options.length,
            allOptions: allOptions.slice(0, 10), // Return first 10 options for reference
          };
        })()
      `,
        returnByValue: true,
      });

      if (result.exceptionDetails) {
        const errorMsg = result.exceptionDetails.exception?.description || "Select failed";
        throw new Error(errorMsg);
      }

      const info = result.result.value as {
        tag: string;
        name: string | null;
        id: string | null;
        selectionMethod: string;
        before: {
          value: string;
          index: number;
          text: string;
        };
        after: {
          index: number;
          value: string;
          text: string;
        };
        totalOptions: number;
        allOptions: Array<{ index: number; value: string; text: string; disabled: boolean }>;
      };

      // Build output message
      let output = `Successfully selected option in element [${args.snapId}]:\n`;
      output += `  Tag: <select>\n`;
      if (info.name) output += `  Name: ${info.name}\n`;
      if (info.id) output += `  ID: ${info.id}\n`;

      output += `\nSelection:\n`;
      output += `  Method: ${info.selectionMethod}\n`;
      output += `  Selected: "${info.after.text}" (value="${info.after.value}", index=${info.after.index})\n`;

      if (info.before.text !== info.after.text) {
        output += `  Previous: "${info.before.text}" (value="${info.before.value}", index=${info.before.index})\n`;
      }

      output += `\nResolution:\n`;
      output += `  Strategy: ${resolution.strategy}\n`;
      output += `  Confidence: ${(resolution.confidence * 100).toFixed(0)}%\n`;

      output += `\nDropdown has ${info.totalOptions} total options`;

      if (info.allOptions.length > 0) {
        output += `:\n`;
        info.allOptions.forEach(opt => {
          const marker = opt.index === info.after.index ? '→ ' : '  ';
          const disabled = opt.disabled ? ' [DISABLED]' : '';
          output += `${marker}[${opt.index}] "${opt.text}" (value="${opt.value}")${disabled}\n`;
        });

        if (info.totalOptions > info.allOptions.length) {
          output += `  ... and ${info.totalOptions - info.allOptions.length} more options\n`;
        }
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

export function setSessionID(sessionID: string) {
  currentSessionID = sessionID;
}
