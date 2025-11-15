/**
 * Health check route handler
 */

import type { Context } from 'hono';

export function handleHealth(c: Context) {
  return c.json({
    status: 'ok',
    message: 'Claude Agent API Server is running',
    endpoints: {
      init: 'POST /init - Initialize user sandbox',
      message: 'POST /message - Send a message and receive SSE stream response'
    }
  });
}
