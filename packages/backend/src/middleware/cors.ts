import { cors as honoCors } from 'hono/cors';

export const cors = () => {
  return honoCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });
};
