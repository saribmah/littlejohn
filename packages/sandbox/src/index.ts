/**
 * Main server entry point
 */

import { createApp } from './app';
import { config } from './config';
import { browserManager } from './browser';

const app = createApp();

console.log(`🚀 Server starting on http://localhost:${config.port}`);
console.log(`📝 POST to http://localhost:${config.port}/message to send a message`);

// Initialize browser on startup (lazy initialization)
browserManager.initialize().catch((error) => {
  console.error('⚠️  Browser initialization failed:', error.message);
  console.log('ℹ️  Browser will be initialized on first use');
});

export default {
  port: config.port,
  fetch: app.fetch,
};
