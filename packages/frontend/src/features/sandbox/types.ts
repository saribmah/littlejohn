/**
 * Sandbox Types
 * Types for sandbox initialization and streaming events
 */

export interface InitRequest {
  sessionID: string;
  userId: string;
  options?: {
    browserPort?: number;
    headless?: boolean;
  };
}

export interface InitEvent {
  type: 'init' | 'message' | 'complete' | 'error';
  data: any;
}

export interface InitProgress {
  status: 'idle' | 'initializing' | 'running' | 'completed' | 'error';
  message: string;
  details?: string;
}

export interface SandboxSession {
  sessionID: string;
  userId: string;
  browser: {
    port: number;
    pid: number;
    headless: boolean;
    stealth: boolean;
  };
  tabs: {
    count: number;
    activeTabId: string | null;
  };
  portfolio?: any;
  positions?: any[];
  timestamp: string;
}
