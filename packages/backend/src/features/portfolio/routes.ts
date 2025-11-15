import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma, auth } from '../auth/auth';
import type { PortfolioPerformanceResponse, PositionsResponse } from './types';

const portfolio = new Hono();

// Helper function to get user from session
async function getUserFromSession(c: any) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

// Get portfolio overview
portfolio.get('/', (c) => {
  return c.json({ message: 'Get portfolio - to be implemented' });
});

// Get portfolio performance
portfolio.get('/performance', async (c) => {
  try {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get or create portfolio for user
    let portfolioData = await prisma.portfolio.findUnique({
      where: { userId: user.id },
    });

    if (!portfolioData) {
      // Create initial portfolio record with zero values
      portfolioData = await prisma.portfolio.create({
        data: {
          userId: user.id,
          currentValue: 0,
          dayChangeValue: 0,
          dayChangePercentage: 0,
          weekChangeValue: 0,
          weekChangePercentage: 0,
          monthChangeValue: 0,
          monthChangePercentage: 0,
          threeMonthChangeValue: 0,
          threeMonthChangePercentage: 0,
          yearChangeValue: 0,
          yearChangePercentage: 0,
        },
      });
    }

    const response: PortfolioPerformanceResponse = {
      performance: {
        currentValue: portfolioData.currentValue,
        dayChange: {
          value: portfolioData.dayChangeValue,
          percentage: portfolioData.dayChangePercentage,
        },
        weekChange: {
          value: portfolioData.weekChangeValue,
          percentage: portfolioData.weekChangePercentage,
        },
        monthChange: {
          value: portfolioData.monthChangeValue,
          percentage: portfolioData.monthChangePercentage,
        },
        threeMonthChange: {
          value: portfolioData.threeMonthChangeValue,
          percentage: portfolioData.threeMonthChangePercentage,
        },
        yearChange: {
          value: portfolioData.yearChangeValue,
          percentage: portfolioData.yearChangePercentage,
        },
      },
      lastUpdated: portfolioData.lastUpdated.toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    return c.json({ error: 'Failed to fetch portfolio performance' }, 500);
  }
});

// Update portfolio performance (for agent/sandbox to update)
portfolio.post(
  '/performance',
  zValidator(
    'json',
    z.object({
      currentValue: z.number(),
      dayChangeValue: z.number(),
      dayChangePercentage: z.number(),
      weekChangeValue: z.number(),
      weekChangePercentage: z.number(),
      monthChangeValue: z.number(),
      monthChangePercentage: z.number(),
      threeMonthChangeValue: z.number(),
      threeMonthChangePercentage: z.number(),
      yearChangeValue: z.number(),
      yearChangePercentage: z.number(),
    })
  ),
  async (c) => {
    try {
      const user = await getUserFromSession(c);

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const data = c.req.valid('json');

      const portfolioData = await prisma.portfolio.upsert({
        where: { userId: user.id },
        update: {
          currentValue: data.currentValue,
          dayChangeValue: data.dayChangeValue,
          dayChangePercentage: data.dayChangePercentage,
          weekChangeValue: data.weekChangeValue,
          weekChangePercentage: data.weekChangePercentage,
          monthChangeValue: data.monthChangeValue,
          monthChangePercentage: data.monthChangePercentage,
          threeMonthChangeValue: data.threeMonthChangeValue,
          threeMonthChangePercentage: data.threeMonthChangePercentage,
          yearChangeValue: data.yearChangeValue,
          yearChangePercentage: data.yearChangePercentage,
          lastUpdated: new Date(),
        },
        create: {
          userId: user.id,
          currentValue: data.currentValue,
          dayChangeValue: data.dayChangeValue,
          dayChangePercentage: data.dayChangePercentage,
          weekChangeValue: data.weekChangeValue,
          weekChangePercentage: data.weekChangePercentage,
          monthChangeValue: data.monthChangeValue,
          monthChangePercentage: data.monthChangePercentage,
          threeMonthChangeValue: data.threeMonthChangeValue,
          threeMonthChangePercentage: data.threeMonthChangePercentage,
          yearChangeValue: data.yearChangeValue,
          yearChangePercentage: data.yearChangePercentage,
        },
      });

      return c.json({ success: true, portfolio: portfolioData });
    } catch (error) {
      console.error('Error updating portfolio performance:', error);
      return c.json({ error: 'Failed to update portfolio performance' }, 500);
    }
  }
);

// Get portfolio positions
portfolio.get('/positions', async (c) => {
  try {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get or create portfolio for user
    let portfolioData = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      include: {
        positions: {
          orderBy: {
            marketValue: 'desc',
          },
        },
      },
    });

    if (!portfolioData) {
      // Create initial portfolio record
      portfolioData = await prisma.portfolio.create({
        data: {
          userId: user.id,
          currentValue: 0,
          dayChangeValue: 0,
          dayChangePercentage: 0,
          weekChangeValue: 0,
          weekChangePercentage: 0,
          monthChangeValue: 0,
          monthChangePercentage: 0,
          threeMonthChangeValue: 0,
          threeMonthChangePercentage: 0,
          yearChangeValue: 0,
          yearChangePercentage: 0,
        },
        include: {
          positions: true,
        },
      });
    }

    const response: PositionsResponse = {
      positions: portfolioData.positions.map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        marketValue: pos.marketValue,
        totalReturn: pos.totalReturn,
        totalReturnPercent: pos.totalReturnPercent,
        dayReturn: pos.dayReturn,
        dayReturnPercent: pos.dayReturnPercent,
      })),
      totalValue: portfolioData.currentValue,
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching portfolio positions:', error);
    return c.json({ error: 'Failed to fetch portfolio positions' }, 500);
  }
});

// Sandbox endpoints for updating portfolio data
// These endpoints are used by the sandbox to update user portfolio and positions

// Helper function to get user ID from sandbox request
async function getUserIdFromSandboxRequest(c: any) {
  // Check for X-User-Id header (sandbox sends this)
  const userId = c.req.header('X-User-Id');

  if (userId) {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      return userId;
    }
  }

  // Fall back to session-based auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  return session?.user?.id;
}

// Update portfolio from sandbox
portfolio.post('/sandbox/update', async (c) => {
  try {
    const userId = await getUserIdFromSandboxRequest(c);

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = await c.req.json();

    const portfolioData = await prisma.portfolio.upsert({
      where: { userId },
      update: {
        currentValue: data.currentValue,
        dayChangeValue: data.dayChangeValue,
        dayChangePercentage: data.dayChangePercentage,
        weekChangeValue: data.weekChangeValue,
        weekChangePercentage: data.weekChangePercentage,
        monthChangeValue: data.monthChangeValue,
        monthChangePercentage: data.monthChangePercentage,
        threeMonthChangeValue: data.threeMonthChangeValue,
        threeMonthChangePercentage: data.threeMonthChangePercentage,
        yearChangeValue: data.yearChangeValue,
        yearChangePercentage: data.yearChangePercentage,
        lastUpdated: new Date(),
      },
      create: {
        userId,
        currentValue: data.currentValue,
        dayChangeValue: data.dayChangeValue,
        dayChangePercentage: data.dayChangePercentage,
        weekChangeValue: data.weekChangeValue,
        weekChangePercentage: data.weekChangePercentage,
        monthChangeValue: data.monthChangeValue,
        monthChangePercentage: data.monthChangePercentage,
        threeMonthChangeValue: data.threeMonthChangeValue,
        threeMonthChangePercentage: data.threeMonthChangePercentage,
        yearChangeValue: data.yearChangeValue,
        yearChangePercentage: data.yearChangePercentage,
      },
    });

    return c.json({ success: true, portfolio: portfolioData });
  } catch (error) {
    console.error('Error updating portfolio from sandbox:', error);
    return c.json({ error: 'Failed to update portfolio' }, 500);
  }
});

// Update positions from sandbox
portfolio.post('/sandbox/positions', async (c) => {
  try {
    const userId = await getUserIdFromSandboxRequest(c);

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { positions } = await c.req.json();

    // Get or create portfolio
    let portfolioData = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolioData) {
      portfolioData = await prisma.portfolio.create({
        data: {
          userId,
          currentValue: 0,
          dayChangeValue: 0,
          dayChangePercentage: 0,
          weekChangeValue: 0,
          weekChangePercentage: 0,
          monthChangeValue: 0,
          monthChangePercentage: 0,
          threeMonthChangeValue: 0,
          threeMonthChangePercentage: 0,
          yearChangeValue: 0,
          yearChangePercentage: 0,
        },
      });
    }

    // Delete existing positions and create new ones
    await prisma.position.deleteMany({
      where: { portfolioId: portfolioData.id },
    });

    // Create new positions
    const createdPositions = await Promise.all(
      positions.map((pos: any) =>
        prisma.position.create({
          data: {
            portfolioId: portfolioData.id,
            symbol: pos.symbol,
            quantity: pos.quantity,
            averagePrice: pos.averagePrice,
            currentPrice: pos.currentPrice,
            marketValue: pos.marketValue,
            totalReturn: pos.totalReturn,
            totalReturnPercent: pos.totalReturnPercent,
            dayReturn: pos.dayReturn,
            dayReturnPercent: pos.dayReturnPercent,
          },
        })
      )
    );

    return c.json({ success: true, positions: createdPositions });
  } catch (error) {
    console.error('Error updating positions from sandbox:', error);
    return c.json({ error: 'Failed to update positions' }, 500);
  }
});

// Get portfolio by broker (must be last to avoid catching specific routes)
portfolio.get('/:broker', (c) => {
  const broker = c.req.param('broker');
  return c.json({ message: `Get ${broker} portfolio - to be implemented` });
});

export default portfolio;
