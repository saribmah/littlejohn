/**
 * Init route handler
 * Handles POST /init endpoint for initializing user sandbox
 */

import type { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { BrowserLauncher, BrowserTabs } from '../browser';
import { browserMcpServer, portfolioMcpServer } from '../mcp';
import { Log } from '../utils';
import { sendSSEMessage, sendCompletionEvent, sendErrorEvent } from '../utils/sse';
import type { InitRequest } from '../types';
import { backendClient } from '../clients';
import { readFile } from 'fs/promises';
import { join } from 'path';

const log = Log.create({ service: 'routes.init' });

export async function handleInit(c: Context) {
  try {
    const body = await c.req.json() as InitRequest;
    const { sessionID, userId, options = {} } = body;

    log.info('initializing sandbox', { sessionID, userId, options });

    // 1. Launch browser with stealth mode enabled (for Robinhood)
    const port = options.browserPort || 9222;
    const headless = options.headless ?? false;

    log.info('launching browser with CDP', { port, headless, stealth: true });

    const browser = await BrowserLauncher.launch({
      port,
      headless,
      stealth: true,
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

    // 3. Fetch initial portfolio data
    let portfolio = null;
    let positions = null;

    if (userId) {
      try {
        log.info('fetching portfolio data from backend', { userId });
        const portfolioData = await backendClient.getPortfolioPerformance(userId);
        portfolio = portfolioData.performance;

        const positionsData = await backendClient.getPositions(userId);
        positions = positionsData.positions;

        log.info('initial portfolio data fetched', {
          currentValue: portfolio?.currentValue,
          positionsCount: positions?.length
        });
      } catch (error) {
        log.error('failed to fetch portfolio data', { error });
      }
    }

    // 4. Stream Robinhood automation with Claude
    return streamSSE(c, async (stream) => {
      try {
        // Send initial status
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'init',
            status: 'starting',
            message: 'Starting Robinhood automation',
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
              }
            }
          }),
          event: 'init',
          id: '0'
        });

        log.info('starting robinhood automation');

        // Load system prompt
        const systemPromptPath = join(process.cwd(), 'src', 'prompt', 'anthropic.txt');
        const systemPrompt = await readFile(systemPromptPath, 'utf-8');

        log.info('loaded system prompt', { length: systemPrompt.length });

        // Execute Claude query with streaming
        const userPrompt = `Go to robinhood.com/login and login by grabbing the credentials from the tool call. Use the "send text" option when prompted after the login and then use the tool to get the code for 2fa, and then try to update the user portfolio and positions by looking at the user portfolio on the page. The userId is "${userId}".`;

        log.info('executing claude query', { promptLength: userPrompt.length });

        let messageCount = 1;

        for await (const sdkMessage of query({
          prompt: userPrompt,
          options: {
            maxTurns: 20,
            permissionMode: 'bypassPermissions',
            systemPrompt,
            mcpServers: {
              'browser-tools': browserMcpServer,
              'portfolio-tools': portfolioMcpServer,
            },
          }
        })) {
          // Log for debugging
          console.log('\n=== Claude Message ===');
          console.log(JSON.stringify(sdkMessage, null, 2));
          console.log('=== End Message ===\n');

          log.info('received message from claude', {
            role: sdkMessage.role,
            type: sdkMessage.type,
            messageCount
          });

          // Stream the message to client
          await sendSSEMessage(stream, sdkMessage, messageCount);
          messageCount++;
        }

        log.info('robinhood automation completed', { messageCount });

        // Fetch updated portfolio and positions
        if (userId) {
          try {
            const portfolioData = await backendClient.getPortfolioPerformance(userId);
            portfolio = portfolioData.performance;

            const positionsData = await backendClient.getPositions(userId);
            positions = positionsData.positions;

            log.info('updated portfolio data fetched', {
              currentValue: portfolio?.currentValue,
              positionsCount: positions?.length
            });
          } catch (error) {
            log.error('failed to fetch updated portfolio data', { error });
          }
        }

        // Send completion with final data
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'complete',
            status: 'success',
            message: 'Sandbox initialized successfully with Robinhood automation',
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
              portfolio,
              positions,
            },
            timestamp: new Date().toISOString(),
          }),
          event: 'complete',
          id: String(messageCount)
        });

      } catch (error) {
        console.error('\n=== Robinhood Automation Error ===');
        console.error('Error:', error);
        console.error('=== End Error ===\n');

        log.error('robinhood automation failed', {
          error: error instanceof Error ? error.message : String(error)
        });

        await sendErrorEvent(stream, error);
      }
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
