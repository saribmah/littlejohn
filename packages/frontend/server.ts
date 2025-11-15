import { serve } from 'bun';
import index from './src/index.html';
import { join } from 'path';

const iconFile = Bun.file(join(process.cwd(), 'public/icon.png'));

const server = serve({
  port: 5173,
  routes: {
    '/icon.png': iconFile,
    '/*': index,
  },
  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Little John Frontend running at ${server.url}`);
