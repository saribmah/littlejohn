/**
 * Analyze route handler
 * Handles POST /analyze endpoint for analyzing user portfolio and suggesting trades
 */

import type { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { portfolioMcpServer } from '../mcp';
import { Log } from '../utils';
import { sendSSEMessage, sendCompletionEvent, sendErrorEvent } from '../utils/sse';
import type { InitRequest } from '../types';
import { backendClient } from '../clients';
import { readFile } from 'fs/promises';
import { join } from 'path';

const log = Log.create({ service: 'routes.analyze' });

export async function handleAnalyze(c: Context) {
  try {
    const body = await c.req.json() as InitRequest;
    const { sessionID, userId } = body;

    log.info('starting portfolio analysis', { sessionID, userId });

    // 1. Fetch portfolio and positions data
    let portfolio = null;
    let positions = null;
    let trades = null;

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    try {
      log.info('fetching portfolio data from backend', { userId });

      const portfolioData = await backendClient.getPortfolioPerformance(userId);
      portfolio = portfolioData.performance;

      const positionsData = await backendClient.getPositions(userId);
      positions = positionsData.positions;

      const tradesData = await backendClient.getTrades(userId);
      trades = tradesData.trades;

      log.info('portfolio data fetched', {
        currentValue: portfolio?.currentValue,
        positionsCount: positions?.length,
        tradesCount: trades?.length
      });
    } catch (error) {
      log.error('failed to fetch portfolio data', { error });
      return c.json({
        error: 'Failed to fetch portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }

    // 2. Stream analysis with Claude
    return streamSSE(c, async (stream) => {
      try {
        // Send initial status
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'init',
            status: 'starting',
            message: 'Starting portfolio analysis',
            session: {
              sessionID,
              userId,
              portfolio,
              positions,
            }
          }),
          event: 'init',
          id: '0'
        });

        log.info('starting portfolio analysis with AI');

        // Load combined system prompt
        const systemPromptPath = join(process.cwd(), 'src', 'prompt', 'combined.txt');
        const systemPrompt = await readFile(systemPromptPath, 'utf-8');

        log.info('loaded analysis system prompt', { length: systemPrompt.length });

        // Build comprehensive context about the portfolio
        const portfolioContext = `
## Current Portfolio Data:

### Performance Metrics:
- Current Value: $${portfolio?.currentValue?.toFixed(2) || 'N/A'}
- Day Change: ${portfolio?.dayChange?.value ? `$${portfolio.dayChange.value.toFixed(2)} (${portfolio.dayChange.percentage.toFixed(2)}%)` : 'N/A'}
- Week Change: ${portfolio?.weekChange?.value ? `$${portfolio.weekChange.value.toFixed(2)} (${portfolio.weekChange.percentage.toFixed(2)}%)` : 'N/A'}
- Month Change: ${portfolio?.monthChange?.value ? `$${portfolio.monthChange.value.toFixed(2)} (${portfolio.monthChange.percentage.toFixed(2)}%)` : 'N/A'}
- Year Change: ${portfolio?.yearChange?.value ? `$${portfolio.yearChange.value.toFixed(2)} (${portfolio.yearChange.percentage.toFixed(2)}%)` : 'N/A'}

### Current Positions:
${positions && positions.length > 0 ? positions.map((pos: any) => {
  const allocation = portfolio?.currentValue ? ((pos.marketValue / portfolio.currentValue) * 100).toFixed(1) : '0';
  return `- ${pos.symbol}: ${pos.quantity} shares @ $${pos.currentPrice?.toFixed(2) || 'N/A'} = $${pos.marketValue?.toFixed(2) || 'N/A'} (${allocation}% of portfolio)
  Total Return: ${pos.totalReturn ? `$${pos.totalReturn.toFixed(2)} (${pos.totalReturnPercent?.toFixed(2)}%)` : 'N/A'}
  Day Return: ${pos.dayReturn ? `$${pos.dayReturn.toFixed(2)} (${pos.dayReturnPercent?.toFixed(2)}%)` : 'N/A'}`;
}).join('\n') : 'No positions found'}

### Recent Trades:
${trades && trades.length > 0 ? trades.slice(0, 10).map((trade: any) =>
  `- ${trade.action} ${trade.symbol}: ${trade.amount} shares @ $${trade.price?.toFixed(2) || 'N/A'} - ${trade.status}`
).join('\n') : 'No recent trades'}
`;

        // Execute Claude query with streaming
        const userPrompt = `${portfolioContext}

Please analyze this portfolio and suggest 3-5 specific trades that could improve portfolio performance, diversification, or risk management. Use the suggest-trade tool to add each suggested trade to the user's queue. The userId is "${userId}".

Focus on actionable recommendations with clear reasoning.`;

        log.info('executing claude query for analysis', { promptLength: userPrompt.length });

        let messageCount = 1;

        for await (const sdkMessage of query({
          prompt: userPrompt,
          options: {
            maxTurns: 10,
            permissionMode: 'bypassPermissions',
            systemPrompt,
            mcpServers: {
              'portfolio-tools': portfolioMcpServer,
            },
          }
        })) {
          // Log for debugging
          console.log('\n=== Analysis Message ===');
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

        log.info('portfolio analysis completed', { messageCount });

        // Fetch updated trades to show suggested trades
        let suggestedTrades: any[] = [];
        try {
          const updatedTradesData = await backendClient.getTrades(userId);
          suggestedTrades = updatedTradesData.trades.filter((t: any) => t.status === 'PENDING');
          log.info('fetched suggested trades', { count: suggestedTrades.length });
        } catch (error) {
          log.error('failed to fetch suggested trades', { error });
          // Continue anyway - don't fail the whole analysis
        }

        // Send completion with final data
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'complete',
            status: 'success',
            message: 'Portfolio analysis completed',
            session: {
              sessionID,
              userId,
              portfolio,
              positions,
              suggestedTrades: suggestedTrades.slice(0, 10),
            },
            timestamp: new Date().toISOString(),
          }),
          event: 'complete',
          id: String(messageCount)
        });

        log.info('sent completion event');

      } catch (error) {
        console.error('\n=== Analysis Error ===');
        console.error('Error:', error);
        console.error('=== End Error ===\n');

        log.error('portfolio analysis failed', {
          error: error instanceof Error ? error.message : String(error)
        });

        await sendErrorEvent(stream, error);
      }
    });

  } catch (error) {
    log.error('analysis endpoint failed', { error });
    console.error('Error in /analyze endpoint:', error);
    return c.json({
      error: 'Failed to analyze portfolio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
