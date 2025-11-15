/**
 * Browser MCP Server Configuration
 * Manages browser automation tools
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
 * MCP server for browser automation tools
 */
export const browserMcpServer = createSdkMcpServer({
  name: 'browser-tools',
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
