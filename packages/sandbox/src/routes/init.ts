/**
 * Init route handler
 * Handles POST /init endpoint for initializing user sandbox
 */

import type { Context } from 'hono';
import { BrowserLauncher, BrowserTabs } from '../browser';
import { Log } from '../utils';
import type { InitRequest } from '../types';

const log = Log.create({ service: 'routes.init' });

export async function handleInit(c: Context) {
  try {
    const body = await c.req.json() as InitRequest;
    const { sessionID, userId, options = {} } = body;

    log.info('initializing sandbox', { sessionID, userId, options });
    
    // 1. Launch browser with stealth mode enabled (for Robinhood)
    // This also connects via CDP automatically
    const port = options.browserPort || 9222;
    const headless = options.headless ?? false; // Default to headed for stealth
    
    log.info('launching browser with CDP', { port, headless, stealth: true });
    
    const browser = await BrowserLauncher.launch({
      port,
      headless,
      stealth: true, // Enable stealth mode for anti-detection
      userDataDir: options.userDataDir,
    });
    
    log.info('browser launched and connected', { 
      port: browser.port, 
      pid: browser.pid,
      target: browser.target 
    });
    
    // 2. Initialize tab management
    log.info('initializing tab management');
    
    await BrowserTabs.initialize();
    
    const tabs = await BrowserTabs.listTabs();
    const activeTabId = await BrowserTabs.getActiveTabId();
    
    log.info('tab management initialized', { 
      tabCount: tabs.length,
      activeTabId 
    });
    
    // 3. Return session details
    return c.json({
      status: 'success',
      message: 'Sandbox initialized successfully',
      session: {
        sessionID,
        userId,
        browser: {
          port: browser.port,
          pid: browser.pid,
          headless,
          stealth: true,
        },
        tabs: {
          count: tabs.length,
          activeTabId,
          tabs: tabs.map(tab => ({
            id: tab.id,
            url: tab.url,
            title: tab.title,
          })),
        },
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    log.error('initialization failed', { error });
    console.error('Error in /init endpoint:', error);
    return c.json({
      error: 'Failed to initialize sandbox',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
