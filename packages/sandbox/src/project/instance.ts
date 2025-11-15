/**
 * Instance state management
 * Provides lifecycle management for stateful resources
 */

export namespace Instance {
  type StateInitializer<T> = () => T;
  type StateCleanup<T> = (state: T) => Promise<void> | void;

  interface StateHolder<T> {
    current: T | null;
    initializer: StateInitializer<T>;
    cleanup: StateCleanup<T> | null;
  }

  const states = new Map<symbol, StateHolder<unknown>>();

  /**
   * Create a managed state instance
   * @param initializer Function to initialize state
   * @param cleanup Optional cleanup function called on shutdown
   * @returns Function to access current state
   */
  export function state<T>(
    initializer: StateInitializer<T>,
    cleanup?: StateCleanup<T>
  ): () => T {
    const key = Symbol();
    
    const holder: StateHolder<T> = {
      current: null,
      initializer,
      cleanup: cleanup || null,
    };

    states.set(key, holder as StateHolder<unknown>);

    return () => {
      if (holder.current === null) {
        holder.current = initializer();
      }
      return holder.current;
    };
  }

  /**
   * Cleanup all managed states
   * Should be called on application shutdown
   */
  export async function cleanup(): Promise<void> {
    const cleanups: Promise<void>[] = [];

    for (const holder of states.values()) {
      if (holder.current && holder.cleanup) {
        const result = holder.cleanup(holder.current);
        if (result instanceof Promise) {
          cleanups.push(result);
        }
      }
    }

    await Promise.all(cleanups);
    states.clear();
  }
}

// Register cleanup on process signals
process.on('SIGINT', async () => {
  await Instance.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await Instance.cleanup();
  process.exit(0);
});
