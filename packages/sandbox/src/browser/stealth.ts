import type CDP from "chrome-remote-interface"
import {Log} from "../utils";

export namespace BrowserStealth {
  const log = Log.create({ service: "browser.stealth" })

  /**
   * Injects JavaScript to mask automation signals
   * This should be called after Page.enable() and Runtime.enable()
   */
  export async function maskAutomation(cdp: CDP.Client): Promise<void> {
    try {
      // Use Page.addScriptToEvaluateOnNewDocument to inject script before any page JavaScript runs
      await cdp.Page.addScriptToEvaluateOnNewDocument({
        source: getStealthScript(),
      })
      log.info("stealth script injected successfully")
    } catch (error) {
      log.error("failed to inject stealth script", { error })
      throw error
    }
  }

  /**
   * Returns the stealth JavaScript code that masks automation signals
   */
  function getStealthScript(): string {
    return `
      // Override navigator.webdriver (backup in case Chrome flag doesn't work)
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Add Chrome runtime object if missing
      if (!window.chrome) {
        window.chrome = {};
      }
      if (!window.chrome.runtime) {
        window.chrome.runtime = {};
      }

      // Override plugins to look like real browser
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: { type: 'application/pdf' },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin',
          },
          {
            0: { type: 'application/x-google-chrome-pdf' },
            description: '',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Viewer',
          },
          {
            0: { type: 'application/x-nacl' },
            description: 'Native Client Executable',
            filename: 'internal-nacl-plugin',
            length: 2,
            name: 'Native Client',
          },
        ],
      });

      // Override permissions API to return expected values
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied', onchange: null, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false })
          : originalQuery(parameters)
      );

      // Override languages to look realistic
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    `
  }

  /**
   * Gets realistic browser user agent string
   * Uses current Chrome version and common OS
   */
  export function getRealisticUserAgent(): string {
    // Use a recent stable Chrome version
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }

  /**
   * Additional Chrome launch arguments for stealth
   * These complement the JavaScript overrides
   */
  export function getStealthArgs(): string[] {
    return [
      // Already present in launcher.ts, but ensuring it's here for reference
      "--disable-blink-features=AutomationControlled",

      // Additional stealth-related flags
      "--disable-dev-shm-usage",
      "--disable-infobars",

      // Realistic window size (not typical headless default of 800x600)
      "--window-size=1920,1080",

      // Set realistic user agent
      `--user-agent=${getRealisticUserAgent()}`,
    ]
  }
}
