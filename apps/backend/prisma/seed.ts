import { PrismaClient } from '@prisma/client';
// import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

// Temporary enum until Prisma client is generated
enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CLIENT = 'CLIENT',
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Demo Organization',
      plan: 'trial',
      locale: 'en',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log('✅ Created demo organization:', demoOrg.name);

  // Create demo users
  const passwordHash = await argon2.hash('password123');
  
  const adminUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'admin@demo.com'
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'admin@demo.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'manager@demo.com'
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'manager@demo.com',
      name: 'Manager User',
      role: UserRole.MANAGER,
      passwordHash,
    },
  });

  const teamUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'team@demo.com'
      }
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'team@demo.com',
      name: 'Team Member',
      role: UserRole.TEAM_MEMBER,
      passwordHash,
    },
  });

  console.log('✅ Created demo users:');
  console.log('  Admin:', adminUser.email);
  console.log('  Manager:', managerUser.email);
  console.log('  Team Member:', teamUser.email);
  console.log('  Password for all: password123');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });