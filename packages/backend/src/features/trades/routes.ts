/**
 * Trade Routes
 * Manages user trades (buy/sell orders)
 */

import { Hono } from 'hono';
import { prisma, auth } from '../auth/auth';
import { TradeAction, TradeStatus } from '@prisma/client';

const app = new Hono();

/**
 * Get all trades for the authenticated user
 * GET /api/trades
 */
app.get('/', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        symbol: true,
        amount: true,
        action: true,
        status: true,
        price: true,
        total: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return c.json({ trades }, 200);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return c.json({ error: 'Failed to fetch trades' }, 500);
  }
});

/**
 * Get a specific trade by ID
 * GET /api/trades/:id
 */
app.get('/:id', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tradeId = c.req.param('id');

    const trade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId: session.user.id
      },
      select: {
        id: true,
        symbol: true,
        amount: true,
        action: true,
        status: true,
        price: true,
        total: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!trade) {
      return c.json({ error: 'Trade not found' }, 404);
    }

    return c.json({ trade }, 200);
  } catch (error) {
    console.error('Error fetching trade:', error);
    return c.json({ error: 'Failed to fetch trade' }, 500);
  }
});

/**
 * Create a new trade
 * POST /api/trades
 */
app.post('/', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { symbol, amount, action, status, price, total, note } = body;

    // Validate required fields
    if (!symbol || typeof symbol !== 'string') {
      return c.json({ error: 'Symbol is required and must be a string' }, 400);
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return c.json({ error: 'Amount is required and must be a positive number' }, 400);
    }

    if (!action || !['BUY', 'SELL'].includes(action)) {
      return c.json({ error: 'Action is required and must be either BUY or SELL' }, 400);
    }

    // Validate status if provided
    if (status && !['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be PENDING, COMPLETED, CANCELLED, or FAILED' }, 400);
    }

    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        symbol: symbol.toUpperCase(), // Store symbols in uppercase
        amount,
        action: action as TradeAction,
        status: (status as TradeStatus) || TradeStatus.PENDING,
        price: price || null,
        total: total || null,
        note: note || null,
      },
      select: {
        id: true,
        symbol: true,
        amount: true,
        action: true,
        status: true,
        price: true,
        total: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return c.json({ trade }, 201);
  } catch (error) {
    console.error('Error creating trade:', error);
    return c.json({ error: 'Failed to create trade' }, 500);
  }
});

/**
 * Update a trade
 * PUT /api/trades/:id
 */
app.put('/:id', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tradeId = c.req.param('id');
    const body = await c.req.json();
    const { symbol, amount, action, status, price, total, note } = body;

    // Verify trade exists and belongs to user
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId: session.user.id
      }
    });

    if (!existingTrade) {
      return c.json({ error: 'Trade not found' }, 404);
    }

    // Validate fields if provided
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return c.json({ error: 'Amount must be a positive number' }, 400);
    }

    if (action && !['BUY', 'SELL'].includes(action)) {
      return c.json({ error: 'Action must be either BUY or SELL' }, 400);
    }

    if (status && !['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be PENDING, COMPLETED, CANCELLED, or FAILED' }, 400);
    }

    // Update the trade
    const trade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        ...(symbol && { symbol: symbol.toUpperCase() }),
        ...(amount !== undefined && { amount }),
        ...(action && { action: action as TradeAction }),
        ...(status && { status: status as TradeStatus }),
        ...(price !== undefined && { price }),
        ...(total !== undefined && { total }),
        ...(note !== undefined && { note }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        symbol: true,
        amount: true,
        action: true,
        status: true,
        price: true,
        total: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return c.json({ trade }, 200);
  } catch (error) {
    console.error('Error updating trade:', error);
    return c.json({ error: 'Failed to update trade' }, 500);
  }
});

/**
 * Delete a trade
 * DELETE /api/trades/:id
 */
app.delete('/:id', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tradeId = c.req.param('id');

    // Verify trade exists and belongs to user
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId: session.user.id
      }
    });

    if (!existingTrade) {
      return c.json({ error: 'Trade not found' }, 404);
    }

    // Delete the trade
    await prisma.trade.delete({
      where: { id: tradeId }
    });

    return c.json({ success: true, message: 'Trade deleted successfully' }, 200);
  } catch (error) {
    console.error('Error deleting trade:', error);
    return c.json({ error: 'Failed to delete trade' }, 500);
  }
});

/**
 * Get trades by status
 * GET /api/trades/status/:status
 */
app.get('/status/:status', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const status = c.req.param('status').toUpperCase();

    if (!['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be PENDING, COMPLETED, CANCELLED, or FAILED' }, 400);
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
        status: status as TradeStatus
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        symbol: true,
        amount: true,
        action: true,
        status: true,
        price: true,
        total: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return c.json({ trades }, 200);
  } catch (error) {
    console.error('Error fetching trades by status:', error);
    return c.json({ error: 'Failed to fetch trades' }, 500);
  }
});

export default app;
