/**
 * SSE Utilities
 * Helper functions for Server-Sent Events streaming
 */

import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';

/**
 * Format and send an SDK message as SSE event
 */
export async function sendSSEMessage(
  stream: any,
  sdkMessage: SDKMessage,
  messageCount: number
): Promise<void> {
  if (sdkMessage.type === 'assistant') {
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'assistant',
        content: sdkMessage.message.content,
        id: sdkMessage.uuid,
        session_id: sdkMessage.session_id
      }),
      event: 'message',
      id: String(messageCount)
    });
  } else if (sdkMessage.type === 'result') {
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'result',
        subtype: sdkMessage.subtype,
        result: sdkMessage.subtype === 'success' ? (sdkMessage as any).result : undefined,
        is_error: sdkMessage.is_error,
        num_turns: sdkMessage.num_turns,
        duration_ms: sdkMessage.duration_ms,
        total_cost_usd: sdkMessage.total_cost_usd,
        usage: sdkMessage.usage,
        session_id: sdkMessage.session_id
      }),
      event: 'result',
      id: String(messageCount)
    });
  } else if (sdkMessage.type === 'system') {
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'system',
        subtype: sdkMessage.subtype,
        info: {
          model: sdkMessage.subtype === 'init' ? sdkMessage.model : undefined,
          tools: sdkMessage.subtype === 'init' ? sdkMessage.tools : undefined,
          session_id: sdkMessage.session_id
        }
      }),
      event: 'system',
      id: String(messageCount)
    });
  } else if (sdkMessage.type === 'user') {
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'user',
        content: sdkMessage.message.content,
        session_id: sdkMessage.session_id
      }),
      event: 'user',
      id: String(messageCount)
    });
  }

  // Add small delay to ensure proper streaming
  await stream.sleep(10);
}

/**
 * Send completion event
 */
export async function sendCompletionEvent(
  stream: any,
  messageCount: number
): Promise<void> {
  await stream.writeSSE({
    data: JSON.stringify({ type: 'complete' }),
    event: 'complete',
    id: String(messageCount)
  });
}

/**
 * Send error event
 */
export async function sendErrorEvent(
  stream: any,
  error: Error | unknown
): Promise<void> {
  await stream.writeSSE({
    data: JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }),
    event: 'error'
  });
}
