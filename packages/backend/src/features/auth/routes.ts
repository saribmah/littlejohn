import { Hono } from 'hono';

const auth = new Hono();

// TODO: Implement authentication routes
auth.post('/login', (c) => {
  return c.json({ message: 'Login endpoint - to be implemented' });
});

auth.post('/logout', (c) => {
  return c.json({ message: 'Logout endpoint - to be implemented' });
});

auth.get('/me', (c) => {
  return c.json({ message: 'Get current user - to be implemented' });
});

export default auth;
