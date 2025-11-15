/**
 * Browser Connection Management
 * Handles CDP (Chrome DevTools Protocol) connections
 */

import type { Page } from 'playwright';

export interface CDPConnection {
  Runtime: {
    evaluate: (params: {
      expression: string;
      returnByValue?: boolean;
    }) => Promise<{ result: { value: any } }>;
  };
}

/**
 * Wrapper for Playwright page to provide CDP-like interface
 */
export class BrowserConnection {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get CDP-compatible interface
   */
  get cdp(): CDPConnection {
    return {
      Runtime: {
        evaluate: async (params) => {
          const result = await this.page.evaluate(params.expression);
          return {
            result: {
              value: result
            }
          };
        }
      }
    };
  }

  /**
   * Get the underlying Playwright page
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Close the connection/page
   */
  async close(): Promise<void> {
    await this.page.close();
  }
}
