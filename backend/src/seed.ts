import 'dotenv/config';
import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: hash,
      firstName: 'Demo',
      lastName: 'User',
      plan: 'PROFESSIONAL',
    },
  });
  console.log(`✅ User: ${user.email}`);

  // Create 3 virtual numbers
  const numbers = [
    { e164Number: '+18005550100', friendlyName: 'Sales Line', numberType: 'TOLL_FREE', timezone: 'America/New_York' },
    { e164Number: '+14155550199', friendlyName: 'Support Line', numberType: 'LOCAL', timezone: 'America/Los_Angeles' },
    { e164Number: '+13125550110', friendlyName: 'Chicago Office', numberType: 'LOCAL', timezone: 'America/Chicago' },
  ];

  for (const num of numbers) {
    const vn = await prisma.virtualNumber.upsert({
      where: { e164Number: num.e164Number },
      update: {},
      create: {
        userId: user.id,
        ...num,
        countryCode: 'US',
        status: 'ACTIVE',
        voicemailGreeting: 'You have reached our voicemail. Please leave a message after the tone.',
      },
    });
    console.log(`✅ Number: ${vn.e164Number} (${vn.friendlyName})`);

    // Add routing rules
    await prisma.routingRule.deleteMany({ where: { virtualNumberId: vn.id } });

    await prisma.routingRule.createMany({
      data: [
        {
          virtualNumberId: vn.id,
          label: 'Business Hours',
          priority: 0,
          activeDays: '1,2,3,4,5',
          openTime: '09:00',
          closeTime: '17:00',
          action: 'FORWARD_PSTN',
          destinations: JSON.stringify([{ type: 'PSTN', value: '+15550001111', order: 1 }]),
          ringStrategy: 'SEQUENTIAL',
          ringTimeout: 30,
        },
        {
          virtualNumberId: vn.id,
          label: 'After Hours Voicemail',
          priority: 1,
          activeDays: '1,2,3,4,5,6,7',
          openTime: null,
          closeTime: null,
          action: 'VOICEMAIL',
          destinations: JSON.stringify([]),
          ringStrategy: 'SEQUENTIAL',
          ringTimeout: 30,
        },
      ],
    });
    console.log(`  ↳ Created 2 routing rules`);
  }

  // Seed some call logs
  const allNumbers = await prisma.virtualNumber.findMany({ where: { userId: user.id } });
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'];

  for (let i = 0; i < 30; i++) {
    const vn = allNumbers[i % allNumbers.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = status === 'COMPLETED' ? Math.floor(30 + Math.random() * 300) : null;
    const daysAgo = Math.floor(Math.random() * 30);
    const startedAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
    const area = Math.floor(200 + Math.random() * 800);
    const line = Math.floor(1000000 + Math.random() * 9000000);

    await prisma.callLog.create({
      data: {
        virtualNumberId: vn.id,
        userId: user.id,
        callerNumber: `+1${area}${line}`,
        calledNumber: vn.e164Number,
        forwardedTo: '+15550001111',
        status,
        duration,
        direction: 'INBOUND',
        startedAt,
        endedAt: duration ? new Date(startedAt.getTime() + duration * 1000) : null,
      },
    });
  }
  console.log(`✅ Seeded 30 call logs`);

  console.log('\n🎉 Seed complete!');
  console.log('   Email:    demo@example.com');
  console.log('   Password: password123\n');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
