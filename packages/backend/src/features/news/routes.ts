import { Hono } from 'hono';

const news = new Hono();

// Get news feed
news.get('/', (c) => {
  return c.json({ message: 'Get news feed - to be implemented' });
});

// Get news for a specific symbol
news.get('/:symbol', (c) => {
  const symbol = c.req.param('symbol');
  return c.json({ message: `Get news for ${symbol} - to be implemented` });
});

// Get sentiment analysis
news.get('/:symbol/sentiment', (c) => {
  const symbol = c.req.param('symbol');
  return c.json({ message: `Get sentiment for ${symbol} - to be implemented` });
});

export default news;
