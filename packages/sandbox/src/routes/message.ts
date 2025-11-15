/**
 * Message route handler
 * Handles POST /message endpoint for Claude interactions
 */

import type { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { customMcpServer } from '../mcp';
import { sendSSEMessage, sendCompletionEvent, sendErrorEvent } from '../utils/sse';
import type { MessageRequest } from '../types';

export async function handleMessage(c: Context) {
  try {
    const body = await c.req.json() as MessageRequest;
    const { message, options = {} } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required and must be a string' }, 400);
    }

    // Return SSE stream
    return streamSSE(c, async (stream) => {
      try {
        let messageCount = 0;

        // Stream Claude's responses
        for await (const sdkMessage of query({
          prompt: message,
          options: {
            maxTurns: options.maxTurns || 10,
            model: options.model,
            permissionMode: 'bypassPermissions',
            includePartialMessages: options.includePartialMessages || false,
            mcpServers: {
              'custom-browser-tools': customMcpServer
            },
            ...options
          }
        })) {
          messageCount++;
          await sendSSEMessage(stream, sdkMessage, messageCount);
        }

        // Send completion event
        await sendCompletionEvent(stream, messageCount + 1);

      } catch (error) {
        await sendErrorEvent(stream, error);
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return c.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
