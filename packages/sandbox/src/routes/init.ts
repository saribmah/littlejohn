/**
 * Init route handler
 * Handles POST /init endpoint for initializing user sandbox
 */

import type { Context } from 'hono';
import { BrowserLauncher, BrowserConnection, BrowserTabs } from '../browser';
import { Log } from '../utils';
import type { InitRequest } from '../types';

const log = Log.create({ service: 'routes.init' });

export async function handleInit(c: Context) {
  try {
    const body = await c.req.json() as InitRequest;
    const { sessionID, userId, options = {} } = body;
    
    // Validate required fields
    if (!sessionID) {
      return c.json({
        error: 'sessionID is required',
      }, 400);
    }

    log.info('initializing sandbox', { sessionID, userId, options });
    
    // 1. Launch browser with stealth mode enabled (for Robinhood)
    const port = options.browserPort || 9222;
    const headless = options.headless ?? false; // Default to headed for stealth
    
    log.info('launching browser', { sessionID, port, headless, stealth: true });
    
    const browser = await BrowserLauncher.launch({
      port,
      headless,
      stealth: true, // Enable stealth mode for anti-detection
      userDataDir: options.userDataDir,
    });
    
    log.info('browser launched', { 
      sessionID, 
      port: browser.port, 
      pid: browser.pid 
    });
    
    // 2. Connect to the browser via CDP
    log.info('connecting to browser', { sessionID, port });
    
    const connection = await BrowserConnection.connect({
      sessionID,
      host: 'localhost',
      port,
    });
    
    log.info('browser connection established', { 
      sessionID, 
      target: connection.target 
    });
    
    // 3. Initialize tab management
    log.info('initializing tab management', { sessionID });
    
    await BrowserTabs.initialize(sessionID);
    
    const tabs = await BrowserTabs.listTabs(sessionID);
    const activeTabId = await BrowserTabs.getActiveTabId(sessionID);
    
    log.info('tab management initialized', { 
      sessionID, 
      tabCount: tabs.length,
      activeTabId 
    });
    
    // 4. Return session details
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
