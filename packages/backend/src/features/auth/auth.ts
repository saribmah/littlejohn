import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { onboarding, createOnboardingStep } from '@better-auth-extended/onboarding';
import { z } from 'zod';
import { env } from '../../config/env';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    onboarding({
      steps: {
        linkRobinhood: createOnboardingStep({
          input: z.object({
            email: z.string().email('Invalid email address'),
            code: z.string().regex(/^\d{5}$/, 'Code must be exactly 5 digits'),
          }),
          async handler(ctx) {
            const { email } = ctx.body;

            // TODO: Implement Robinhood linking logic here
            // For now, just validate and store the information
            
            return { 
              success: true,
              email,
              linked: true,
            };
          },
          required: true,
          once: true,
        }),
        goal: createOnboardingStep({
          input: z.object({
            goal: z.enum(['fast', 'steady', 'experiment', 'risk', 'balanced']),
          }),
          async handler(ctx) {
            const { goal } = ctx.body;

            // TODO: Store user's investment goal preference
            // You might want to save this to a user preferences table
            
            return { 
              success: true,
              goal,
            };
          },
          required: true,
          once: false, // Allow users to change their goal later
        }),
        risk: createOnboardingStep({
          input: z.object({
            riskLevel: z.enum(['low', 'medium', 'high']),
          }),
          async handler(ctx) {
            const { riskLevel } = ctx.body;

            // TODO: Store user's risk tolerance preference
            
            return { 
              success: true,
              riskLevel,
            };
          },
          required: true,
          once: false, // Allow users to change their risk tolerance later
        }),
        period: createOnboardingStep({
          input: z.object({
            months: z.enum(['6', '24', '48']).transform(val => parseInt(val, 10)),
          }),
          async handler(ctx) {
            const { months } = ctx.body;

            // TODO: Store user's investment period preference
            
            return { 
              success: true,
              months,
            };
          },
          required: true,
          once: false, // Allow users to change their investment period later
        }),
        exclusions: createOnboardingStep({
          input: z.object({
            exclusions: z.array(z.string()).default([]),
          }),
          async handler(ctx) {
            const { exclusions } = ctx.body;

            // TODO: Store user's investment exclusions
            // These could be sectors, companies, or industries they want to avoid
            
            return { 
              success: true,
              exclusions,
              count: exclusions.length,
            };
          },
          required: true,
          once: false, // Allow users to update their exclusions later
        }),
      },
      completionStep: 'exclusions',
    }),
  ],
});

export type Auth = typeof auth;
