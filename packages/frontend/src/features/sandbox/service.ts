/**
 * Sandbox Service
 * Handles communication with the sandbox server
 */

import { env } from '../../config/env';
import type { InitRequest, InitEvent, SandboxSession } from './types';

export const sandboxService = {
  /**
   * Initialize sandbox with SSE streaming
   */
  async initSandbox(
    request: InitRequest,
    onEvent: (event: InitEvent) => void
  ): Promise<void> {
    const response = await fetch(`${env.SANDBOX_URL}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Sandbox initialization failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body for SSE stream');
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const data = line.substring(5).trim();

            try {
              const parsedData = JSON.parse(data);

              onEvent({
                type: currentEvent as any,
                data: parsedData,
              });
            } catch (error) {
              console.error('Failed to parse SSE data:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
