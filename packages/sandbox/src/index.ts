/**
 * Main server entry point
 */

import { createApp } from './app';
import { config } from './config';

const app = createApp();

console.log(`🚀 Server starting on http://localhost:${config.port}`);
console.log(`📝 POST to http://localhost:${config.port}/init to initialize a session`);
console.log(`📝 POST to http://localhost:${config.port}/message to send a message`);
console.log('ℹ️  Browser instances will be launched per-session as needed');

export default {
  port: config.port,
  fetch: app.fetch,
};
