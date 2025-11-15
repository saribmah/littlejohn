/**
 * MCP Server Configuration
 * Exports custom MCP tools and server instance
 */

import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { browserInfoTool } from './tools/browser-info';
import { browserNavigateTool } from './tools/browser-navigate';
import { browserClickTool } from './tools/browser-click';
import { browserTypeTool } from './tools/browser-type';
import { browserSelectTool } from './tools/browser-select';
import { browserGetDOMSnapshotTool } from './tools/browser-get-dom-snapshot';
import { browserListTabsTool } from './tools/browser-list-tabs';
import { browserCreateTabTool } from './tools/browser-create-tab';
import { browserCloseTabTool } from './tools/browser-close-tab';
import { browserSwitchTabTool } from './tools/browser-switch-tab';

/**
 * MCP server with all custom tools
 */
export const customMcpServer = createSdkMcpServer({
  name: 'custom-browser-tools',
  version: '1.0.0',
  tools: [
    browserInfoTool,
    browserNavigateTool,
    browserClickTool,
    browserTypeTool,
    browserSelectTool,
    browserGetDOMSnapshotTool,
    browserListTabsTool,
    browserCreateTabTool,
    browserCloseTabTool,
    browserSwitchTabTool,
  ]
});
