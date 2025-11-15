import type { MiddlewareHandler } from 'hono';

export const logger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${c.res.status} [${ms}ms]`);
  };
};
