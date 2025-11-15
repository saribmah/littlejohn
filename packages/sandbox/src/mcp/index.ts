/**
 * MCP Server Configuration
 * Exports all custom MCP tools and server instance
 */

export { customMcpServer } from './server';

// Export all browser tools
export { browserInfoTool } from './tools/browser-info';
export { browserNavigateTool } from './tools/browser-navigate';
export { browserClickTool } from './tools/browser-click';
export { browserTypeTool } from './tools/browser-type';
export { browserSelectTool } from './tools/browser-select';
export { browserGetDOMSnapshotTool } from './tools/browser-get-dom-snapshot';
export { browserListTabsTool } from './tools/browser-list-tabs';
export { browserCreateTabTool } from './tools/browser-create-tab';
export { browserCloseTabTool } from './tools/browser-close-tab';
export { browserSwitchTabTool } from './tools/browser-switch-tab';
