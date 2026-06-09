import 'dotenv/config';
import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database with large dataset...');

  // Create additional users
  const hash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      plan: 'ENTERPRISE',
    },
  });
  console.log(`✅ Admin User: ${admin.email}`);

  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      passwordHash: hash,
      firstName: 'Agent',
      lastName: 'One',
      plan: 'STARTER',
    },
  });
  console.log(`✅ Agent User: ${agent.email}`);

  // Seed data for admin user
  const adminNumbers = [
    { e164Number: '+18885551000', friendlyName: 'Toll-Free Billing Support', numberType: 'TOLL_FREE', timezone: 'America/New_York', countryCode: 'US' },
    { e164Number: '+442079460192', friendlyName: 'UK Regional Office', numberType: 'LOCAL', timezone: 'Europe/London', countryCode: 'GB' },
  ];

  for (const num of adminNumbers) {
    const vn = await prisma.virtualNumber.upsert({
      where: { e164Number: num.e164Number },
      update: {},
      create: {
        userId: admin.id,
        e164Number: num.e164Number,
        friendlyName: num.friendlyName,
        numberType: num.numberType,
        timezone: num.timezone,
        countryCode: num.countryCode,
        status: 'ACTIVE',
        voicemailGreeting: 'Thank you for calling. Please leave a voicemail.',
      }
    });

    // Add rules
    await prisma.routingRule.createMany({
      data: [
        {
          virtualNumberId: vn.id,
          label: 'Default Voicemail',
          priority: 10,
          activeDays: '1,2,3,4,5,6,7',
          openTime: null,
          closeTime: null,
          action: 'VOICEMAIL',
          destinations: '[]',
        }
      ]
    }).catch(() => {});
  }

  // Add 120 more call logs to the main demo user to simulate high-traffic dashboard stats
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (demoUser) {
    const vn = await prisma.virtualNumber.findFirst({ where: { userId: demoUser.id } });
    if (vn) {
      console.log(`Seeding 120 extra call logs for demo user on number ${vn.e164Number}...`);
      const statuses = ['COMPLETED', 'NO_ANSWER', 'VOICEMAIL', 'FAILED', 'BUSY'];
      const callers = ['+12125550192', '+13125550143', '+442079460111', '+81355550143'];
      
      for (let i = 0; i < 120; i++) {
        const status = statuses[i % statuses.length];
        const duration = status === 'COMPLETED' ? Math.floor(30 + Math.random() * 300) : null;
        const startedAt = new Date(Date.now() - (i % 30) * 86400000 - Math.random() * 3600000 * 12);
        
        await prisma.callLog.create({
          data: {
            virtualNumberId: vn.id,
            userId: demoUser.id,
            callerNumber: callers[i % callers.length],
            calledNumber: vn.e164Number,
            forwardedTo: '+15550001111',
            status,
            duration,
            direction: 'INBOUND',
            startedAt,
            endedAt: duration ? new Date(startedAt.getTime() + duration * 1000) : null,
          }
        });
      }
      console.log('✅ Added 120 extra logs');
    }
  }

  console.log('🎉 Large seed complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
