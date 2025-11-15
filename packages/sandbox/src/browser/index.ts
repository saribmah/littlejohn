/**
 * Browser Manager
 * Manages Playwright browser instance lifecycle
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private isInitializing = false;

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      console.log('🌐 Launching Chromium browser...');

      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get browser instance (initialize if needed)
   */
  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.initialize();
    }
    return this.browser!;
  }

  /**
   * Get browser context (initialize if needed)
   */
  async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      await this.initialize();
    }
    return this.context!;
  }

  /**
   * Create a new page
   */
  async newPage(): Promise<Page> {
    const context = await this.getContext();
    return await context.newPage();
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Browser closed');
    }
  }

  /**
   * Check if browser is running
   */
  isRunning(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }
}

// Singleton instance
export const browserManager = new BrowserManager();

// Cleanup on process exit
process.on('SIGINT', async () => {
  await browserManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await browserManager.close();
  process.exit(0);
});

// Export launcher for CDP-based browser management
export { BrowserLauncher } from './launcher';
export { BrowserStealth } from './stealth';
