import { serve } from 'bun';
import index from './src/index.html';

const server = serve({
  port: 5173,
  routes: {
    '/*': index,
  },
  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Little John Frontend running at ${server.url}`);
