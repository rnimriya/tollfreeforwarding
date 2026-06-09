import 'dotenv/config';
import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      passwordHash: hash,
    },
    create: {
      email: 'demo@example.com',
      passwordHash: hash,
      firstName: 'Demo',
      lastName: 'User',
      plan: 'PROFESSIONAL',
    },
  });
  console.log(`✅ User: ${user.email}`);

  const supportIvrFlow = {
    nodes: [
      {
        id: 'root',
        type: 'ivr',
        position: { x: 250, y: 50 },
        data: { kind: 'greeting', label: 'Welcome Greeting', prompt: 'Welcome to our Support line. Please choose from the options.' }
      },
      {
        id: 'menu1',
        type: 'ivr',
        position: { x: 250, y: 180 },
        data: { kind: 'menu', label: 'Main Menu', prompt: 'Press 1 for Tech Support, or press 2 to leave a message.', timeout: 5 }
      },
      {
        id: 'forward1',
        type: 'ivr',
        position: { x: 100, y: 320 },
        data: { kind: 'forward', label: 'Tech Support Staff', value: '+15551234567', ringTimeout: 30 }
      },
      {
        id: 'voicemail1',
        type: 'ivr',
        position: { x: 400, y: 320 },
        data: { kind: 'voicemail', label: 'Voicemail Box', prompt: 'Please leave a message after the tone.' }
      }
    ],
    edges: [
      {
        id: 'e-root-menu1',
        source: 'root',
        target: 'menu1',
        animated: true,
        style: { stroke: 'var(--accent)', strokeWidth: 2 }
      },
      {
        id: 'e-menu1-forward1',
        source: 'menu1',
        target: 'forward1',
        sourceHandle: null,
        targetHandle: null,
        label: 'Option 1',
        animated: true,
        style: { stroke: 'var(--accent)', strokeWidth: 2 }
      },
      {
        id: 'e-menu1-voicemail1',
        source: 'menu1',
        target: 'voicemail1',
        sourceHandle: null,
        targetHandle: null,
        label: 'Option 2',
        animated: true,
        style: { stroke: 'var(--accent)', strokeWidth: 2 }
      }
    ]
  };

  // Clear old data for demo user to prevent duplicate keys/bloat on re-runs
  await prisma.routingRule.deleteMany({ where: { virtualNumber: { userId: user.id } } });
  await prisma.callLog.deleteMany({ where: { userId: user.id } });
  await prisma.virtualNumber.deleteMany({ where: { userId: user.id } });

  // Create 5 virtual numbers
  const numbers = [
    { e164Number: '+18005550100', friendlyName: 'US Sales Hotline', numberType: 'TOLL_FREE', timezone: 'America/New_York', ivrEnabled: false, ivrFlow: null, countryCode: 'US' },
    { e164Number: '+14155550199', friendlyName: 'SF Support Attendant', numberType: 'LOCAL', timezone: 'America/Los_Angeles', ivrEnabled: true, ivrFlow: JSON.stringify(supportIvrFlow), countryCode: 'US' },
    { e164Number: '+13125550110', friendlyName: 'Chicago Branch Office', numberType: 'LOCAL', timezone: 'America/Chicago', ivrEnabled: false, ivrFlow: null, countryCode: 'US' },
    { e164Number: '+442071234567', friendlyName: 'London HQ Reception', numberType: 'LOCAL', timezone: 'Europe/London', ivrEnabled: false, ivrFlow: null, countryCode: 'GB' },
    { e164Number: '+81355550188', friendlyName: 'Tokyo Operations Desk', numberType: 'LOCAL', timezone: 'Asia/Tokyo', ivrEnabled: false, ivrFlow: null, countryCode: 'JP' },
  ];

  for (const num of numbers) {
    const vn = await prisma.virtualNumber.create({
      data: {
        userId: user.id,
        e164Number: num.e164Number,
        friendlyName: num.friendlyName,
        numberType: num.numberType,
        timezone: num.timezone,
        ivrEnabled: num.ivrEnabled,
        ivrFlow: num.ivrFlow,
        countryCode: num.countryCode,
        status: 'ACTIVE',
        voicemailGreeting: 'You have reached our voicemail. Please leave a message after the tone.',
      },
    });
    console.log(`✅ Number: ${vn.e164Number} (${vn.friendlyName})`);

    // Add routing rules
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

  // Seed 60 diverse, realistic call logs distributed across the last 30 days
  const allNumbers = await prisma.virtualNumber.findMany({ where: { userId: user.id } });
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'];
  const callerPrefixes = ['+1415', '+1212', '+4420', '+813', '+331', '+612'];

  for (let i = 0; i < 60; i++) {
    const vn = allNumbers[i % allNumbers.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = status === 'COMPLETED' ? Math.floor(45 + Math.random() * 450) : null;
    
    // Distribute call dates evenly over the last 30 days
    const daysAgo = Math.floor(i / 2); // 0 to 30 days ago
    const startedAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 3600000 * 8);
    const line = Math.floor(1000 + Math.random() * 9000);
    const prefix = callerPrefixes[Math.floor(Math.random() * callerPrefixes.length)];

    await prisma.callLog.create({
      data: {
        virtualNumberId: vn.id,
        userId: user.id,
        callerNumber: `${prefix}555${line}`,
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
  console.log(`✅ Seeded 60 call logs`);

  console.log('\n🎉 Seed complete!');
  console.log('   Email:    demo@example.com');
  console.log('   Password: password123\n');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
