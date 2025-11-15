import { Hono } from 'hono';
import { auth } from './auth';

const authRoutes = new Hono();

// Better Auth handles all auth routes automatically
// Mount the Better Auth handler to catch all /api/auth/* requests
authRoutes.on(['GET', 'POST'], '/*', (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
