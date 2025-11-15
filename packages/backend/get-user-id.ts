/**
 * Quick script to get a user ID from the database
 */

import { prisma } from './src/features/auth/auth';

async function getUserId() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (user) {
      console.log('Found user:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
    } else {
      console.log('No users found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserId();
