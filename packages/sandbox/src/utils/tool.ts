/**
 * Tool Definition Utility
 * Helper for creating MCP tools with consistent structure
 */

import { tool as sdkTool } from '@anthropic-ai/claude-agent-sdk';
import type { ZodRawShape } from 'zod';
import { z } from 'zod';

export interface ToolContext {
  sessionID: string;
}

export interface ToolResult {
  title?: string;
  metadata?: Record<string, any>;
  output: string;
}

export class Tool {
  /**
   * Define a tool with consistent structure
   */
  static define<TSchema extends ZodRawShape>(
    name: string,
    factory: () => Promise<{
      description: string;
      parameters: z.ZodObject<TSchema>;
      execute: (args: z.infer<z.ZodObject<TSchema>>, ctx: ToolContext) => Promise<ToolResult>;
    }>
  ) {
    // Return a function that creates the SDK tool
    return async (sessionID: string) => {
      const config = await factory();
      
      return sdkTool(
        name,
        config.description,
        config.parameters.shape,
        async (args) => {
          try {
            const result = await config.execute(args as any, { sessionID });
            
            // Format output
            let outputText = result.output;
            if (result.title) {
              outputText = `${result.title}\n\n${outputText}`;
            }
            
            return {
              content: [
                {
                  type: 'text' as const,
                  text: outputText
                }
              ]
            };
          } catch (error) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Error: ${error instanceof Error ? error.message : String(error)}`
                }
              ],
              isError: true
            };
          }
        }
      );
    };
  }
}
