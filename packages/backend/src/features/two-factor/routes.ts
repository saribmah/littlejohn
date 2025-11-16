/**
 * Two-Factor Authentication Routes
 * Manages 2FA codes for Robinhood login
 */

import { Hono } from 'hono';
import { prisma, auth } from '../auth/auth';

const app = new Hono();

/**
 * Get user's 2FA code
 * GET /api/two-factor
 */
app.get('/', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const twoFactor = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        code: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!twoFactor) {
      return c.json({ twoFactor: null }, 200);
    }

    return c.json({ twoFactor }, 200);
  } catch (error) {
    console.error('Error fetching 2FA code:', error);
    return c.json({ error: 'Failed to fetch 2FA code' }, 500);
  }
});

/**
 * Create or update user's 2FA code
 * POST /api/two-factor
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
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return c.json({ error: 'Code is required and must be a string' }, 400);
    }

    // Upsert 2FA code
    const twoFactor = await prisma.twoFactorAuth.upsert({
      where: { userId: session.user.id },
      update: {
        code,
        enabled: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        code,
        enabled: true,
      },
      select: {
        id: true,
        code: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return c.json({ twoFactor }, 200);
  } catch (error) {
    console.error('Error saving 2FA code:', error);
    return c.json({ error: 'Failed to save 2FA code' }, 500);
  }
});

/**
 * Delete user's 2FA code
 * DELETE /api/two-factor
 */
app.delete('/', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await prisma.twoFactorAuth.deleteMany({
      where: { userId: session.user.id }
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error('Error deleting 2FA code:', error);
    return c.json({ error: 'Failed to delete 2FA code' }, 500);
  }
});

/**
 * Get 2FA code by user ID (for sandbox use)
 * GET /api/two-factor/user/:userId?use=true
 * Uses X-User-Id header for authentication (sandbox only)
 * Query params:
 *   - use: boolean - If true, marks the 2FA code as used (enabled=false)
 */
app.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const useCode = c.req.query('use') === 'true';

    // Check for sandbox authentication
    const headerUserId = c.req.header('X-User-Id');
    if (headerUserId && headerUserId === userId) {
      // Sandbox authentication - allow access
      // Only return enabled 2FA codes
      const twoFactor = await prisma.twoFactorAuth.findFirst({
        where: {
          userId,
          enabled: true  // Only return enabled codes
        },
        select: {
          id: true,
          code: true,
          enabled: true,
        }
      });

      if (!twoFactor) {
        return c.json({ twoFactor: null }, 200);
      }

      // If use=true, mark the code as used
      if (useCode) {
        await prisma.twoFactorAuth.update({
          where: { id: twoFactor.id },
          data: { enabled: false }
        });
      }

      return c.json({ twoFactor }, 200);
    }

    // Regular session authentication
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (!session || !session.user || session.user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only return enabled 2FA codes
    const twoFactor = await prisma.twoFactorAuth.findFirst({
      where: {
        userId,
        enabled: true  // Only return enabled codes
      },
      select: {
        id: true,
        code: true,
        enabled: true,
      }
    });

    if (!twoFactor) {
      return c.json({ twoFactor: null }, 200);
    }

    // If use=true, mark the code as used
    if (useCode) {
      await prisma.twoFactorAuth.update({
        where: { id: twoFactor.id },
        data: { enabled: false }
      });
    }

    return c.json({ twoFactor }, 200);
  } catch (error) {
    console.error('Error fetching 2FA code:', error);
    return c.json({ error: 'Failed to fetch 2FA code' }, 500);
  }
});

export default app;
