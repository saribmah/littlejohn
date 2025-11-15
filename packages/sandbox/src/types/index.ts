/**
 * Type definitions for the application
 */

export interface MessageRequest {
  message: string;
  options?: MessageOptions;
}

export interface MessageOptions {
  maxTurns?: number;
  model?: string;
  includePartialMessages?: boolean;
  [key: string]: any;
}

export interface SSEMessage {
  type: string;
  [key: string]: any;
}

export interface InitRequest {
  sessionID: string;
  userId?: string;
  options?: InitOptions;
}

export interface InitOptions {
  browserPort?: number;
  headless?: boolean;
  userDataDir?: string;
}
