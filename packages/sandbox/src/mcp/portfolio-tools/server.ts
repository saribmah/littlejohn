/**
 * Portfolio MCP Server Configuration
 * Manages portfolio and position update tools
 */

import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { updateUserPortfolioTool } from './update-user-portfolio';
import { updateUserPositionsTool } from './update-user-positions';
import { getRobinhoodCredentialsTool } from './get-robinhood-credentials';
import { getRobinhoodTextCodeTool } from './get-robinhood-text-code';
import { suggestTradeTool } from './suggest-trade';

/**
 * MCP server for portfolio management tools
 */
export const portfolioMcpServer = createSdkMcpServer({
  name: 'portfolio-tools',
  version: '1.0.0',
  tools: [
    updateUserPortfolioTool,
    updateUserPositionsTool,
    getRobinhoodCredentialsTool,
    getRobinhoodTextCodeTool,
    suggestTradeTool,
  ]
});
