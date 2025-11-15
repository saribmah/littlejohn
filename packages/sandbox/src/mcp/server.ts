/**
 * MCP Server Configuration
 * Exports custom MCP tools and server instance
 */

import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { browserInfoTool } from './tools/browser-info';

/**
 * MCP server with all custom tools
 */
export const customMcpServer = createSdkMcpServer({
  name: 'custom-browser-tools',
  version: '1.0.0',
  tools: [browserInfoTool]
});
