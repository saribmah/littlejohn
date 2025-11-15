/**
 * MCP Servers Configuration
 * Exports all MCP servers and tools
 */

// Export MCP servers
export { browserMcpServer } from './server';
export { portfolioMcpServer } from './portfolio-tools';

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

// Export portfolio tools
export { updateUserPortfolioTool } from './portfolio-tools/update-user-portfolio';
export { updateUserPositionsTool } from './portfolio-tools/update-user-positions';
