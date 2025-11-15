import { Log } from "../utils/log"

export namespace Extractor {
  const log = Log.create({ service: "browser.extractor" })

  /**
   * Locator bundle for element resolution at action time
   */
  export interface LocatorBundle {
    frameId: string
    role: string | null
    name: string | null // accessible name
    css: string | null // robust CSS selector
    xpath: string | null
    textHash: string | null // hash of normalized text
    tag: string
    attrs: {
      id?: string
      name?: string
      type?: string
      href?: string
      placeholder?: string
      value?: string
      disabled?: boolean
    }
  }

  /**
   * Element information from extraction
   */
  export interface ElementInfo {
    snapId: string
    tag: string
    text: string
    locators: LocatorBundle
  }

  /**
   * Result of in-page extraction
   */
  export interface ExtractionResult {
    elements: ElementInfo[]
    frameId: string
  }

  /**
   * Generate in-page extraction script
   * This script runs inside the browser context to extract interactive elements
   */
  export function generateExtractionScript(frameId: string = "main"): string {
    return `
      (() => {
        // Helper: Compute accessible name following ARIA algorithm (simplified)
        function getAccessibleName(el) {
          // aria-label takes priority
          if (el.hasAttribute('aria-label')) {
            return el.getAttribute('aria-label').trim();
          }

          // aria-labelledby
          if (el.hasAttribute('aria-labelledby')) {
            const id = el.getAttribute('aria-labelledby');
            const labelEl = document.getElementById(id);
            if (labelEl) {
              return labelEl.textContent.trim().replace(/\\s+/g, ' ');
            }
          }

          // Associated label (for inputs)
          if (el.id) {
            const label = document.querySelector(\`label[for="\${CSS.escape(el.id)}"]\`);
            if (label) {
              return label.textContent.trim().replace(/\\s+/g, ' ');
            }
          }

          // Fallback to text content
          const text = (el.textContent || '').trim().replace(/\\s+/g, ' ');
          return text.substring(0, 200);
        }

        // Helper: Get implicit role based on element type
        function getRole(el) {
          const explicit = (el.getAttribute('role') || '').toLowerCase();
          if (explicit) return explicit;

          const tag = el.tagName.toLowerCase();

          if (tag === 'a' && el.hasAttribute('href')) return 'link';
          if (tag === 'button') return 'button';

          if (tag === 'input') {
            const type = (el.type || 'text').toLowerCase();
            if (['button', 'submit', 'reset'].includes(type)) return 'button';
            if (['text', 'email', 'search', 'url', 'tel', 'password', 'number'].includes(type)) {
              return 'textbox';
            }
            if (type === 'checkbox') return 'checkbox';
            if (type === 'radio') return 'radio';
          }

          if (tag === 'textarea') return 'textbox';
          if (tag === 'select') return 'combobox';

          return null;
        }

        // Helper: Build robust CSS selector
        function buildRobustCSS(el) {
          const parts = [el.tagName.toLowerCase()];

          // Add stable attributes
          if (el.id) parts.push(\`#\${CSS.escape(el.id)}\`);
          if (el.name) parts.push(\`[name="\${CSS.escape(el.name)}"]\`);
          if (el.type) parts.push(\`[type="\${CSS.escape(el.type)}"]\`);
          if (el.getAttribute('role')) {
            parts.push(\`[role="\${CSS.escape(el.getAttribute('role'))}"]\`);
          }
          if (el.getAttribute('aria-label')) {
            parts.push(\`[aria-label="\${CSS.escape(el.getAttribute('aria-label'))}"]\`);
          }
          if (el.placeholder) {
            parts.push(\`[placeholder="\${CSS.escape(el.placeholder)}"]\`);
          }
          if (el.href) {
            parts.push(\`[href="\${CSS.escape(el.href)}"]\`);
          }

          return parts.join('');
        }

        // Helper: Generate simple XPath
        function buildXPath(el) {
          const parts = [];
          let current = el;

          while (current && current.nodeType === Node.ELEMENT_NODE) {
            let index = 0;
            let sibling = current.previousSibling;

            while (sibling) {
              if (sibling.nodeType === Node.ELEMENT_NODE &&
                  sibling.tagName === current.tagName) {
                index++;
              }
              sibling = sibling.previousSibling;
            }

            const tagName = current.tagName.toLowerCase();
            const part = index > 0 ? \`\${tagName}[\${index + 1}]\` : tagName;
            parts.unshift(part);

            current = current.parentElement;

            // Stop at body to avoid too-long paths
            if (current && current.tagName.toLowerCase() === 'body') {
              parts.unshift('body');
              break;
            }
          }

          return '//' + parts.join('/');
        }

        // Helper: Generate text hash (simple 32-bit rolling hash)
        function textHash(text) {
          if (!text) return null;

          const normalized = text.trim().replace(/\\s+/g, ' ').substring(0, 200);
          if (!normalized) return null;

          let hash = 0;
          for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }

          return Math.abs(hash).toString(36);
        }

        // Find all interactive elements
        const interactiveSelectors = [
          'a[href]',
          'button',
          'input',
          'textarea',
          'select',
          '[role="button"]',
          '[role="link"]',
          '[role="textbox"]',
          '[role="combobox"]',
          '[role="checkbox"]',
          '[role="radio"]',
          '[onclick]',
          '[tabindex]',
        ];

        const elements = [];
        const seen = new Set();

        interactiveSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            // Skip if already processed
            if (seen.has(el)) return;
            seen.add(el);

            // Skip hidden elements
            const style = window.getComputedStyle(el);
            const isVisible = el.offsetParent !== null &&
                            style.display !== 'none' &&
                            style.visibility !== 'hidden' &&
                            parseFloat(style.opacity) > 0;

            if (!isVisible) return;

            // Skip disabled elements
            if (el.disabled) return;

            const role = getRole(el);
            const name = getAccessibleName(el);
            const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').substring(0, 200);

            elements.push({
              snapId: elements.length.toString(),
              tag: el.tagName.toLowerCase(),
              text: text,
              locators: {
                frameId: ${JSON.stringify(frameId)},
                role: role,
                name: name || null,
                css: buildRobustCSS(el),
                xpath: buildXPath(el),
                textHash: textHash(text),
                tag: el.tagName.toLowerCase(),
                attrs: {
                  id: el.id || undefined,
                  name: el.name || undefined,
                  type: el.type || undefined,
                  href: el.href || undefined,
                  placeholder: el.placeholder || undefined,
                  value: el.value || undefined,
                  disabled: el.disabled || undefined,
                }
              }
            });
          });
        });

        // Prioritize search inputs and text inputs - move them to the front of the list
        // This helps AI find search boxes quickly
        const priorityElements = [];
        const regularElements = [];

        elements.forEach(el => {
          const isSearchInput =
            el.tag === 'input' && (
              (el.locators.attrs.type === 'search') ||
              (el.locators.attrs.type === 'text') ||
              (el.locators.attrs.type === 'email') ||
              (el.locators.attrs.placeholder &&
                el.locators.attrs.placeholder.toLowerCase().includes('search')) ||
              (el.locators.attrs.name &&
                el.locators.attrs.name.toLowerCase().includes('search')) ||
              (el.locators.attrs.id &&
                el.locators.attrs.id.toLowerCase().includes('search'))
            ) || el.tag === 'textarea';

          if (isSearchInput) {
            priorityElements.push(el);
          } else {
            regularElements.push(el);
          }
        });

        // Combine priority elements first, then regular elements
        const sortedElements = [...priorityElements, ...regularElements];

        // Re-assign snapIds based on new order
        sortedElements.forEach((el, index) => {
          el.snapId = index.toString();
        });

        return {
          elements: sortedElements,
          frameId: ${JSON.stringify(frameId)}
        };
      })()
    `
  }

  /**
   * Extract elements from a page using CDP
   */
  export async function extract(
    cdp: any,
    frameId: string = "main"
  ): Promise<ExtractionResult> {
    log.info("extracting elements", { frameId })

    const script = generateExtractionScript(frameId)

    const result = await cdp.Runtime.evaluate({
      expression: script,
      returnByValue: true,
      awaitPromise: true,
    })

    if (result.exceptionDetails) {
      const error = result.exceptionDetails.exception?.description || "Extraction failed"
      log.error("extraction failed", { error })
      throw new Error(error)
    }

    const extractionResult = result.result.value as ExtractionResult

    log.info("extraction complete", {
      elementCount: extractionResult.elements.length,
      frameId: extractionResult.frameId,
    })

    return extractionResult
  }
}
