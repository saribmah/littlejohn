/**
 * Logging utility
 */

export namespace Log {
  export interface LogContext {
    service: string;
  }

  export interface Logger {
    info(message: string, data?: Record<string, unknown>): void;
    error(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
  }

  export function create(context: LogContext): Logger {
    const prefix = `[${context.service}]`;

    return {
      info(message: string, data?: Record<string, unknown>) {
        console.log(prefix, message, data ? JSON.stringify(data, null, 2) : '');
      },
      error(message: string, data?: Record<string, unknown>) {
        console.error(prefix, message, data ? JSON.stringify(data, null, 2) : '');
      },
      warn(message: string, data?: Record<string, unknown>) {
        console.warn(prefix, message, data ? JSON.stringify(data, null, 2) : '');
      },
      debug(message: string, data?: Record<string, unknown>) {
        console.debug(prefix, message, data ? JSON.stringify(data, null, 2) : '');
      },
    };
  }
}
