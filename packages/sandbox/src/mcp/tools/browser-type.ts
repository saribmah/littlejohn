/**
 * Browser Type Tool
 * Type text into input fields or textareas
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { BrowserTabs } from '../../browser/tabs';
import { SnapshotStorage } from '../../browser/snapshot-storage';
import { Resolver } from '../../browser/resolver';

let currentSessionID = 'default';

export const browserTypeTool = tool(
  'browser-type',
  "CRITICAL: browser-type APPENDS text to existing content. It does NOT replace text. " +
    "To type and submit in ONE call, use pressEnter=true. NEVER call this twice with the same text or you will create duplicates (e.g., typing 'test' twice results in 'testtest'). " +
    "\n\nType text into an input field or textarea using a snapshot ID and element ID. " +
    "You must call browser-get-dom-snapshot first to get the snapshot ID and identify elements. " +
    "The element is resolved at action time using robust locators. " +
    "\n\nFor single-field forms (search boxes, email login): ALWAYS set pressEnter=true to submit in the same call. " +
    "For multi-field forms: Fill each field, then set pressEnter=true on the last field OR click submit button. " +
    "Do NOT navigate to constructed URLs after typing - use pressEnter instead to simulate real user behavior.",
  {
    snapshotId: z
      .string()
      .describe("The snapshot ID from browser-get-dom-snapshot output (e.g., 'snap_1234567890_abc123')."),

    snapId: z
      .string()
      .describe("The element snapId from the snapshot (e.g., '0', '1', '2'). Get this from browser-get-dom-snapshot output."),

    text: z
      .string()
      .describe("The text to type into the input field. Can be empty string to clear the field."),

    tabId: z
      .string()
      .optional()
      .describe("Optional tab ID. If not provided, uses the active tab."),

    clear: z
      .boolean()
      .optional()
      .default(true)
      .describe("Clear existing text before typing. Default: true"),

    pressEnter: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Press Enter key after typing to submit the form. REQUIRED for single-field forms (search boxes, email login). " +
        "Use this to type and submit in ONE call - do NOT call browser-type twice. " +
        "For search boxes: type query with pressEnter=true. For email login: type email with pressEnter=true. " +
        "Default: false"
      ),

    delay: z
      .number()
      .optional()
      .default(0)
      .describe("Delay in milliseconds between each character (for realistic typing). Default: 0 (instant)"),
  },
  async (args) => {
    try {
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

      // Type into the element using full resolver script
      const typeResult = await tab.cdp.Runtime.evaluate({
        expression: `
        (async () => {
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
          if (!element && locators.tag) {
            const matches = Array.from(document.querySelectorAll(locators.tag));
            const visible = matches.filter(el => {
              if (!isVisible(el)) return false;
              // For inputs/textareas, match by name or id if available
              if (locators.attrs.name && el.name === locators.attrs.name) return true;
              if (locators.attrs.id && el.id === locators.attrs.id) return true;
              return false;
            });
            if (visible.length > 0) element = visible[0];
          }

          if (!element) {
            throw new Error('Could not find element to type into after resolution');
          }

          // Check if it's an input or textarea
          const isInput = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
          if (!isInput) {
            const actualRole = getRole(element);
            const actualText = getAccessibleName(element);
            throw new Error(
              'Element is not an input or textarea. ' +
              'Found: <' + element.tagName.toLowerCase() + '> with role="' + (actualRole || 'none') + '"' +
              (actualText ? ' and text="' + actualText.substring(0, 100) + '"' : '') +
              '\\n\\nOnly INPUT and TEXTAREA elements can receive text input.' +
              '\\n\\nThis suggests you selected the wrong element. Common causes:' +
              '\\n  - Using snapId for a link/button instead of an input' +
              '\\n  - Search box not extracted in snapshot (try selector: "header" or increase maxTokens)' +
              '\\n  - Page structure changed since snapshot (get fresh snapshot)' +
              '\\n\\nDebugging steps:' +
              '\\n  1. Check the HTML snapshot for input elements with type="text" or type="search"' +
              '\\n  2. If you see the input in HTML but not in elements list, get a focused snapshot' +
              '\\n  3. If input still missing, it may be dynamically loaded - try waiting or clicking to reveal it'
            );
          }

          // Check if element is disabled
          if (element.disabled) {
            throw new Error('Element is disabled and cannot accept input.');
          }

          // Get element info before typing
          const valueBefore = element.value || '';

          // Focus the element
          element.focus();

// Helper function to set value using native setter (for React compatibility)
function setNativeValue(element, value) {
  const proto = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  const nativeSet = descriptor ? descriptor.set : null;
  
  if (nativeSet) {
    // Store last value for React tracker
    const lastValue = element.value;
    
    // Use native setter
    nativeSet.call(element, value);
    
    // React 16+ specific handling
    const tracker = element._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
  } else {
    // Fallback to direct assignment
    element.value = value;
  }
}

// Clear if requested
if (${args.clear}) {
  setNativeValue(element, '');
  element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

// Type the text
const text = ${JSON.stringify(args.text)};
const delay = ${args.delay || 0};

if (delay > 0) {
  // Type with delay between characters (realistic typing)
  for (let i = 0; i < text.length; i++) {
    const newValue = (${args.clear} && i === 0 ? '' : element.value) + text.substring(0, i + 1);
    setNativeValue(element, newValue);
    
    // Dispatch events for each character
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { key: text[i], bubbles: true, composed: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: text[i], bubbles: true, composed: true }));
    
    if (i < text.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
} else {
  // Type instantly
  const newValue = (${args.clear} ? '' : element.value) + text;
  setNativeValue(element, newValue);
  element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

// Trigger change event and blur/focus for validation
element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

// Blur and refocus to trigger validation (many form libraries require this)
const hadFocus = document.activeElement === element;
element.blur();
if (hadFocus && !${args.pressEnter || false}) {
  // Only refocus if we're not submitting the form
  setTimeout(() => element.focus(), 0);
}

// Press Enter if requested
if (${args.pressEnter}) {
  // Create comprehensive keyboard event options
  const keyEventOptions = {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    charCode: 13,
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window
  };

  // Dispatch all three keyboard events (some frameworks check all three)
  element.dispatchEvent(new KeyboardEvent('keydown', keyEventOptions));
  element.dispatchEvent(new KeyboardEvent('keypress', keyEventOptions));
  element.dispatchEvent(new KeyboardEvent('keyup', keyEventOptions));

  // If it's in a form, try multiple submission strategies
  const form = element.closest('form');
  if (form) {
    // Strategy 1: Dispatch submit event (for JavaScript handlers)
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const wasNotPrevented = form.dispatchEvent(submitEvent);

    // Strategy 2: If event wasn't prevented, try form.submit() after a small delay
    if (wasNotPrevented) {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check if we're still on the same page and form exists
      if (document.body.contains(form)) {
        try {
          form.submit();
        } catch (e) {
          // Form submission might fail if JavaScript already handled it
          console.log('Form.submit() failed, likely already handled by JavaScript');
        }
      }
    }
  }
}

          return {
            tag: element.tagName.toLowerCase(),
            type: element.type || null,
            name: element.name || null,
            placeholder: element.placeholder || null,
            valueBefore: valueBefore,
            valueAfter: element.value,
            length: element.value.length,
          };
        })()
      `,
        returnByValue: true,
        awaitPromise: true,
      });

      if (typeResult.exceptionDetails) {
        const errorMsg = typeResult.exceptionDetails.exception?.description || "Type failed";
        throw new Error(errorMsg);
      }

      const info = typeResult.result.value as {
        tag: string;
        type: string | null;
        name: string | null;
        placeholder: string | null;
        valueBefore: string;
        valueAfter: string;
        length: number;
      };

      // Build output message
      let output = `Successfully typed into element [${args.snapId}]:\n`;
      output += `  Tag: <${info.tag}>\n`;
      if (info.type) output += `  Type: ${info.type}\n`;
      if (info.name) output += `  Name: ${info.name}\n`;
      if (info.placeholder) output += `  Placeholder: "${info.placeholder}"\n`;

      if (args.clear) {
        output += `  Cleared: "${info.valueBefore}" → ""\n`;
      } else if (info.valueBefore) {
        output += `  Previous value: "${info.valueBefore}"\n`;
      }

      output += `  New value: "${info.valueAfter}" (${info.length} characters)\n`;
      output += `\nResolution:\n`;
      output += `  Strategy: ${resolution.strategy}\n`;
      output += `  Confidence: ${(resolution.confidence * 100).toFixed(0)}%\n`;

      if (args.pressEnter) {
        output += `\n✓ Pressed Enter key (form may have been submitted)`;
      }

      if (args.delay > 0) {
        output += `\n✓ Typed with ${args.delay}ms delay between characters`;
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
