import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma, auth } from '../auth/auth';
import type {
  LinkRobinhoodInput,
  SetGoalInput,
  SetRiskInput,
  SetPeriodInput,
  SetExclusionsInput,
} from './types';

const onboardingRoutes = new Hono();

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

// Get onboarding status
onboardingRoutes.get('/status', async (c) => {
  const user = await getUserFromSession(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const profile = await prisma.onboardingProfile.findUnique({
    where: { userId: user.id },
  });

  return c.json({
    completed: profile?.completed ?? false,
    profile,
  });
});

// Link Robinhood account
onboardingRoutes.post(
  '/link-robinhood',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      code: z.string().regex(/^\d{5}$/),
    })
  ),
  async (c) => {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { email } = c.req.valid('json') as LinkRobinhoodInput;

    // TODO: Actually verify the code with Robinhood API

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: {
        robinhoodEmail: email,
        robinhoodLinked: true,
      },
      create: {
        userId: user.id,
        robinhoodEmail: email,
        robinhoodLinked: true,
      },
    });

    return c.json({ success: true, profile });
  }
);

// Set goal
onboardingRoutes.post(
  '/goal',
  zValidator(
    'json',
    z.object({
      goal: z.enum(['fast', 'steady', 'experiment', 'risk', 'balanced']),
    })
  ),
  async (c) => {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { goal } = c.req.valid('json') as SetGoalInput;

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: { goal },
      create: { userId: user.id, goal },
    });

    return c.json({ success: true, profile });
  }
);

// Set risk level
onboardingRoutes.post(
  '/risk',
  zValidator(
    'json',
    z.object({
      riskLevel: z.enum(['low', 'medium', 'high']),
    })
  ),
  async (c) => {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { riskLevel } = c.req.valid('json') as SetRiskInput;

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: { riskLevel },
      create: { userId: user.id, riskLevel },
    });

    return c.json({ success: true, profile });
  }
);

// Set period
onboardingRoutes.post(
  '/period',
  zValidator(
    'json',
    z.object({
      months: z.union([z.literal(6), z.literal(24), z.literal(48)]),
    })
  ),
  async (c) => {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { months } = c.req.valid('json') as SetPeriodInput;

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: { period: months },
      create: { userId: user.id, period: months },
    });

    return c.json({ success: true, profile });
  }
);

// Set exclusions
onboardingRoutes.post(
  '/exclusions',
  zValidator(
    'json',
    z.object({
      exclusions: z.array(z.string()),
    })
  ),
  async (c) => {
    const user = await getUserFromSession(c);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { exclusions } = c.req.valid('json') as SetExclusionsInput;

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: {
        exclusions: JSON.stringify(exclusions),
        completed: true, // Mark onboarding as complete
      },
      create: {
        userId: user.id,
        exclusions: JSON.stringify(exclusions),
        completed: true,
      },
    });

    return c.json({ success: true, profile });
  }
);

export { onboardingRoutes };
