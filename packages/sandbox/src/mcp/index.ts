/**
 * MCP Server Configuration
 * Exports all custom MCP tools and server instance
 */

export { customMcpServer } from './server';

// Export all browser tools
export { browserInfoTool, setSessionID as setInfoSessionID } from './tools/browser-info';
export { browserNavigateTool, setSessionID as setNavigateSessionID } from './tools/browser-navigate';
export { browserClickTool, setSessionID as setClickSessionID } from './tools/browser-click';
export { browserTypeTool, setSessionID as setTypeSessionID } from './tools/browser-type';
export { browserSelectTool, setSessionID as setSelectSessionID } from './tools/browser-select';
export { browserGetDOMSnapshotTool, setSessionID as setDOMSnapshotSessionID } from './tools/browser-get-dom-snapshot';
export { browserListTabsTool, setSessionID as setListTabsSessionID } from './tools/browser-list-tabs';
export { browserCreateTabTool, setSessionID as setCreateTabSessionID } from './tools/browser-create-tab';
export { browserCloseTabTool, setSessionID as setCloseTabSessionID } from './tools/browser-close-tab';
export { browserSwitchTabTool, setSessionID as setSwitchTabSessionID } from './tools/browser-switch-tab';

// Helper to set session ID for all tools at once
export function setAllToolsSessionID(sessionID: string) {
  const { setSessionID: setInfoSID } = require('./tools/browser-info');
  const { setSessionID: setNavigateSID } = require('./tools/browser-navigate');
  const { setSessionID: setClickSID } = require('./tools/browser-click');
  const { setSessionID: setTypeSID } = require('./tools/browser-type');
  const { setSessionID: setSelectSID } = require('./tools/browser-select');
  const { setSessionID: setDOMSnapshotSID } = require('./tools/browser-get-dom-snapshot');
  const { setSessionID: setListTabsSID } = require('./tools/browser-list-tabs');
  const { setSessionID: setCreateTabSID } = require('./tools/browser-create-tab');
  const { setSessionID: setCloseTabSID } = require('./tools/browser-close-tab');
  const { setSessionID: setSwitchTabSID } = require('./tools/browser-switch-tab');
  
  setInfoSID(sessionID);
  setNavigateSID(sessionID);
  setClickSID(sessionID);
  setTypeSID(sessionID);
  setSelectSID(sessionID);
  setDOMSnapshotSID(sessionID);
  setListTabsSID(sessionID);
  setCreateTabSID(sessionID);
  setCloseTabSID(sessionID);
  setSwitchTabSID(sessionID);
}
