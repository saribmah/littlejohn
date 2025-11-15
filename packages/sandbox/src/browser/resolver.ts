import { Log } from "../utils"
import type { Extractor } from "./extractor"

export namespace Resolver {
  const log = Log.create({ service: "browser.resolver" })

  /**
   * Request to resolve an element
   */
  export interface ResolutionRequest {
    locators: Extractor.LocatorBundle
    minConfidence?: number
  }

  /**
   * Strategy used to resolve element
   */
  export type Strategy = "role-name" | "css" | "xpath" | "fuzzy"

  /**
   * Report of resolution attempt
   */
  export interface ResolutionReport {
    success: boolean
    strategy: Strategy | null
    confidence: number
    element?: {
      tag: string
      text: string
      role: string | null
      name: string | null
      visible: boolean
    }
    error?: string
    candidateCount?: number
  }

  /**
   * Options for resolver
   */
  export interface ResolverOptions {
    minConfidence?: number
  }

  /**
   * Generate in-page resolution script
   * Returns a script that finds the best matching element
   */
  export function generateResolutionScript(
    locators: Extractor.LocatorBundle,
    minConfidence: number = 0.75
  ): string {
    return `
      (() => {
        const locators = ${JSON.stringify(locators)};
        const minConfidence = ${minConfidence};

        // Helper: Get accessible name
        function getAccessibleName(el) {
          if (el.hasAttribute('aria-label')) {
            return el.getAttribute('aria-label').trim();
          }
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

        // Helper: Get role
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

        // Helper: Check visibility
        function isVisible(el) {
          const style = window.getComputedStyle(el);
          return el.offsetParent !== null &&
                 style.display !== 'none' &&
                 style.visibility !== 'hidden' &&
                 parseFloat(style.opacity) > 0;
        }

        // Helper: Text hash
        function textHash(text) {
          if (!text) return null;
          const normalized = text.trim().replace(/\\s+/g, ' ').substring(0, 200);
          if (!normalized) return null;

          let hash = 0;
          for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          return Math.abs(hash).toString(36);
        }

        // Helper: String similarity (simple Levenshtein-like)
        function stringSimilarity(a, b) {
          if (!a || !b) return 0;
          if (a === b) return 1;

          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          if (aLower === bLower) return 0.95;

          // Simple word overlap score
          const aWords = new Set(aLower.split(/\\s+/));
          const bWords = new Set(bLower.split(/\\s+/));
          const intersection = [...aWords].filter(w => bWords.has(w)).length;
          const union = new Set([...aWords, ...bWords]).size;

          return union > 0 ? intersection / union : 0;
        }

        // Helper: Score a candidate element
        function scoreCandidate(el) {
          const role = getRole(el);
          const name = getAccessibleName(el);
          const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').substring(0, 200);
          const hash = textHash(text);

          let score = 0;

          // Role match (35%)
          if (locators.role && role === locators.role) {
            score += 0.35;
          }

          // Name similarity (35%)
          if (locators.name) {
            const nameSim = stringSimilarity(locators.name, name);
            if (nameSim >= 0.9) {
              score += 0.35;
            } else {
              score += 0.35 * nameSim;
            }
          } else if (!name) {
            // If both don't have names, that's also a match
            score += 0.35;
          }

          // Attribute overlap (15%)
          let attrMatches = 0;
          let attrTotal = 0;
          if (locators.attrs.id) {
            attrTotal++;
            if (el.id === locators.attrs.id) attrMatches++;
          }
          if (locators.attrs.name) {
            attrTotal++;
            if (el.name === locators.attrs.name) attrMatches++;
          }
          if (locators.attrs.type) {
            attrTotal++;
            if (el.type === locators.attrs.type) attrMatches++;
          }
          if (locators.attrs.href) {
            attrTotal++;
            if (el.href === locators.attrs.href) attrMatches++;
          }
          if (attrTotal > 0) {
            score += 0.15 * (attrMatches / attrTotal);
          } else {
            score += 0.15; // No attributes to match
          }

          // Text hash match (10%)
          if (locators.textHash && hash === locators.textHash) {
            score += 0.10;
          }

          // Tag match (5%)
          if (locators.tag === el.tagName.toLowerCase()) {
            score += 0.05;
          }

          return { score, role, name, el };
        }

        // Strategy 1: Role + Name exact match
        if (locators.role && locators.name) {
          const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
            if (!isVisible(el)) return false;
            const role = getRole(el);
            const name = getAccessibleName(el);
            return role === locators.role &&
                   name.toLowerCase() === locators.name.toLowerCase();
          });

          if (candidates.length === 1) {
            const el = candidates[0];
            return {
              success: true,
              strategy: 'role-name',
              confidence: 1.0,
              element: {
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim().substring(0, 100),
                role: getRole(el),
                name: getAccessibleName(el),
                visible: true,
              }
            };
          }

          if (candidates.length > 1) {
            // Multiple matches, fall through to scoring
          }
        }

        // Strategy 2: CSS selector
        if (locators.css) {
          try {
            const matches = Array.from(document.querySelectorAll(locators.css));
            const visible = matches.filter(isVisible);

            if (visible.length === 1) {
              const el = visible[0];
              return {
                success: true,
                strategy: 'css',
                confidence: 0.95,
                element: {
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent || '').trim().substring(0, 100),
                  role: getRole(el),
                  name: getAccessibleName(el),
                  visible: true,
                }
              };
            }

            if (visible.length > 1) {
              // Multiple matches, use scoring
              const scored = visible.map(el => scoreCandidate(el))
                .sort((a, b) => b.score - a.score);

              if (scored[0].score >= minConfidence) {
                const el = scored[0].el;
                return {
                  success: true,
                  strategy: 'css',
                  confidence: scored[0].score,
                  element: {
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || '').trim().substring(0, 100),
                    role: scored[0].role,
                    name: scored[0].name,
                    visible: true,
                  },
                  candidateCount: visible.length,
                };
              }
            }
          } catch (e) {
            // CSS selector invalid, continue to next strategy
          }
        }

        // Strategy 3: XPath
        if (locators.xpath) {
          try {
            const result = document.evaluate(
              locators.xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            );

            if (result.singleNodeValue && isVisible(result.singleNodeValue)) {
              const el = result.singleNodeValue;
              return {
                success: true,
                strategy: 'xpath',
                confidence: 0.9,
                element: {
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent || '').trim().substring(0, 100),
                  role: getRole(el),
                  name: getAccessibleName(el),
                  visible: true,
                }
              };
            }
          } catch (e) {
            // XPath invalid, continue to next strategy
          }
        }

        // Strategy 4: Fuzzy matching - score all visible elements
        const allElements = Array.from(document.querySelectorAll('*')).filter(isVisible);
        const scored = allElements
          .map(el => scoreCandidate(el))
          .filter(s => s.score > 0)
          .sort((a, b) => b.score - a.score);

        if (scored.length > 0 && scored[0].score >= minConfidence) {
          const best = scored[0];
          return {
            success: true,
            strategy: 'fuzzy',
            confidence: best.score,
            element: {
              tag: best.el.tagName.toLowerCase(),
              text: (best.el.textContent || '').trim().substring(0, 100),
              role: best.role,
              name: best.name,
              visible: true,
            },
            candidateCount: scored.length,
          };
        }

        // No match found
        return {
          success: false,
          strategy: null,
          confidence: 0,
          error: 'No element found matching the locators with sufficient confidence. The page may have changed since the snapshot was taken.',
          candidateCount: scored.length,
        };
      })()
    `
  }

  /**
   * Resolve an element using CDP
   */
  export async function resolve(
    cdp: any,
    request: ResolutionRequest
  ): Promise<ResolutionReport> {
    const minConfidence = request.minConfidence || 0.75

    log.info("resolving element", {
      role: request.locators.role,
      name: request.locators.name?.substring(0, 50),
      minConfidence,
    })

    const script = generateResolutionScript(request.locators, minConfidence)

    const result = await cdp.Runtime.evaluate({
      expression: script,
      returnByValue: true,
      awaitPromise: true,
    })

    if (result.exceptionDetails) {
      const error = result.exceptionDetails.exception?.description || "Resolution failed"
      log.error("resolution failed", { error })
      return {
        success: false,
        strategy: null,
        confidence: 0,
        error,
      }
    }

    const report = result.result.value as ResolutionReport

    log.info("resolution complete", {
      success: report.success,
      strategy: report.strategy,
      confidence: report.confidence,
      candidateCount: report.candidateCount,
    })

    return report
  }
}
