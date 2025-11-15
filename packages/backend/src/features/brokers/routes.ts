import { Hono } from 'hono';

const brokers = new Hono();

// List supported brokers
brokers.get('/', (c) => {
  return c.json({
    brokers: [
      { id: 'robinhood', name: 'Robinhood', status: 'available' },
      { id: 'interactive_brokers', name: 'Interactive Brokers', status: 'planned' },
      { id: 'td_ameritrade', name: 'TD Ameritrade', status: 'planned' },
      { id: 'alpaca', name: 'Alpaca', status: 'planned' },
    ],
  });
});

// Connect a broker account
brokers.post('/connect', (c) => {
  return c.json({ message: 'Connect broker - to be implemented' });
});

// Disconnect a broker account
brokers.delete('/:broker', (c) => {
  const broker = c.req.param('broker');
  return c.json({ message: `Disconnect ${broker} - to be implemented` });
});

// Get broker connection status
brokers.get('/:broker/status', (c) => {
  const broker = c.req.param('broker');
  return c.json({ message: `Get ${broker} status - to be implemented` });
});

export default brokers;
