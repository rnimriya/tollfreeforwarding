import 'dotenv/config';
import { prisma } from './lib/prisma.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number, jitterHours = 0): Date {
  return new Date(Date.now() - n * 86_400_000 - Math.random() * jitterHours * 3_600_000);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CALL_STATUSES = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'];

// ─── ADMIN seed (ENTERPRISE) ──────────────────────────────────────────────────

async function seedAdmin() {
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@example.com' } });

  // Wipe stale data so this script is idempotent
  await prisma.callLog.deleteMany({ where: { userId: admin.id } });
  await prisma.routingRule.deleteMany({ where: { virtualNumber: { userId: admin.id } } });
  await prisma.virtualNumber.deleteMany({ where: { userId: admin.id } });

  const enterpriseIvrFlow = JSON.stringify({
    version: '1.0',
    nodes: [
      { id: 'root', type: 'ivr', position: { x: 250, y: 50 },  data: { kind: 'greeting',  label: 'Welcome',       prompt: 'Welcome to Apex Corp. For Sales press 1, Support press 2, Billing press 3.' } },
      { id: 'menu1', type: 'ivr', position: { x: 250, y: 180 }, data: { kind: 'menu',      label: 'Main Menu',     prompt: 'Press 1 Sales, 2 Support, 3 Billing.', timeout: 5 } },
      { id: 'sales', type: 'ivr', position: { x: 50,  y: 320 }, data: { kind: 'forward',   label: 'Sales Team',    value: '+18005550101', ringTimeout: 30 } },
      { id: 'sup',   type: 'ivr', position: { x: 250, y: 320 }, data: { kind: 'forward',   label: 'Support Team',  value: '+18005550102', ringTimeout: 45 } },
      { id: 'bill',  type: 'ivr', position: { x: 450, y: 320 }, data: { kind: 'voicemail', label: 'Billing VM',    prompt: 'Billing is closed. Leave your account number and we will call back.' } },
    ],
    edges: [
      { id: 'e1', source: 'root',  target: 'menu1', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e2', source: 'menu1', target: 'sales', label: 'Option 1', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e3', source: 'menu1', target: 'sup',   label: 'Option 2', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e4', source: 'menu1', target: 'bill',  label: 'Option 3', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
    ],
    root: 'root',
  });

  const numbers = [
    {
      e164Number: '+18885550200', friendlyName: 'US Toll-Free Main Line',    numberType: 'TOLL_FREE', timezone: 'America/New_York',     countryCode: 'US',
      ivrEnabled: true, ivrFlow: enterpriseIvrFlow,
      voicemailGreeting: 'You have reached Apex Corp. Our offices are currently closed. Please leave a detailed message and we will return your call within one business day.',
      rules: [
        { label: 'Business Hours – Ring Group', priority: 0, activeDays: '1,2,3,4,5', openTime: '08:00', closeTime: '18:00', action: 'RING_GROUP',    ringStrategy: 'SIMULTANEOUS', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+18005550101', order: 1 }, { type: 'PSTN', value: '+18005550102', order: 2 }, { type: 'PSTN', value: '+18005550103', order: 3 }]) },
        { label: 'After Hours Voicemail',       priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+12125550210', friendlyName: 'New York HQ',               numberType: 'LOCAL',     timezone: 'America/New_York',     countryCode: 'US',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'You have reached the New York headquarters of Apex Corp. Please leave a message.',
      rules: [
        { label: 'Weekday Office Hours',   priority: 0, activeDays: '1,2,3,4,5', openTime: '09:00', closeTime: '17:30', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 25, destinations: JSON.stringify([{ type: 'PSTN', value: '+12125550211', order: 1 }]) },
        { label: 'Saturday Reduced Hours', priority: 1, activeDays: '6',          openTime: '10:00', closeTime: '14:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 20, destinations: JSON.stringify([{ type: 'PSTN', value: '+12125550212', order: 1 }]) },
        { label: 'Closed – Voicemail',     priority: 2, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+14155550220', friendlyName: 'San Francisco West Coast',  numberType: 'LOCAL',     timezone: 'America/Los_Angeles',  countryCode: 'US',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'West Coast office voicemail. Please leave your name and number.',
      rules: [
        { label: 'Pacific Business Hours', priority: 0, activeDays: '1,2,3,4,5', openTime: '08:00', closeTime: '17:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+14155550221', order: 1 }]) },
        { label: 'After Hours',            priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+13125550230', friendlyName: 'Chicago Midwest Office',    numberType: 'LOCAL',     timezone: 'America/Chicago',      countryCode: 'US',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'Apex Corp Chicago. Leave a message after the tone.',
      rules: [
        { label: 'Business Hours', priority: 0, activeDays: '1,2,3,4,5', openTime: '08:30', closeTime: '17:00', action: 'RING_GROUP', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+13125550231', order: 1 }, { type: 'PSTN', value: '+13125550232', order: 2 }]) },
        { label: 'Voicemail',      priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+442071550240', friendlyName: 'London UK Office',         numberType: 'LOCAL',     timezone: 'Europe/London',        countryCode: 'GB',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'You have reached Apex Corp London. Please leave a message.',
      rules: [
        { label: 'UK Business Hours',  priority: 0, activeDays: '1,2,3,4,5', openTime: '09:00', closeTime: '17:30', action: 'FORWARD_SIP',  ringStrategy: 'SEQUENTIAL', ringTimeout: 35, destinations: JSON.stringify([]), sipUri: 'sip:london@apex-corp.sip.twilio.com' },
        { label: 'UK After Hours VM',  priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+4930155550250', friendlyName: 'Berlin EU Office',        numberType: 'LOCAL',     timezone: 'Europe/Berlin',        countryCode: 'DE',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'Apex Corp Berlin. Bitte hinterlassen Sie eine Nachricht.',
      rules: [
        { label: 'CET Business Hours', priority: 0, activeDays: '1,2,3,4,5', openTime: '08:00', closeTime: '17:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+4930155550251', order: 1 }]) },
        { label: 'Voicemail',          priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+61255550260', friendlyName: 'Sydney APAC Office',        numberType: 'LOCAL',     timezone: 'Australia/Sydney',     countryCode: 'AU',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'Apex Corp Sydney. Please leave a message and we will get back to you.',
      rules: [
        { label: 'AEST Business Hours', priority: 0, activeDays: '1,2,3,4,5', openTime: '08:00', closeTime: '17:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+61255550261', order: 1 }]) },
        { label: 'Voicemail',           priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+18005550270', friendlyName: 'Sales Hotline Toll-Free',   numberType: 'TOLL_FREE', timezone: 'America/New_York',     countryCode: 'US',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'Thank you for contacting Apex Corp Sales. Leave your details and a sales rep will call you shortly.',
      rules: [
        { label: 'Sales Team Hours',  priority: 0, activeDays: '1,2,3,4,5', openTime: '07:00', closeTime: '20:00', action: 'RING_GROUP', ringStrategy: 'SIMULTANEOUS', ringTimeout: 40, destinations: JSON.stringify([{ type: 'PSTN', value: '+18005550271', order: 1 }, { type: 'PSTN', value: '+18005550272', order: 2 }, { type: 'PSTN', value: '+18005550273', order: 3 }, { type: 'PSTN', value: '+18005550274', order: 4 }]) },
        { label: 'Weekend Sales',     priority: 1, activeDays: '6,7',        openTime: '09:00', closeTime: '17:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+18005550275', order: 1 }]) },
        { label: 'Voicemail',         priority: 2, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
    },
    {
      e164Number: '+16505550280', friendlyName: 'Engineering On-Call',       numberType: 'LOCAL',     timezone: 'America/Los_Angeles',  countryCode: 'US',
      ivrEnabled: false, ivrFlow: null,
      voicemailGreeting: 'Engineering on-call line. If this is an emergency please stay on the line.',
      rules: [
        { label: '24/7 On-Call', priority: 0, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'RING_GROUP', ringStrategy: 'SIMULTANEOUS', ringTimeout: 60, destinations: JSON.stringify([{ type: 'PSTN', value: '+16505550281', order: 1 }, { type: 'PSTN', value: '+16505550282', order: 2 }]) },
      ],
    },
  ];

  const callerPools = ['+12125550001', '+13105550002', '+16175550003', '+17135550004', '+14045550005', '+12025550006', '+13305550007', '+16095550008', '+442079460001', '+4930155500002', '+61255500003'];

  for (const num of numbers) {
    const vn = await prisma.virtualNumber.create({
      data: {
        userId: admin.id,
        e164Number: num.e164Number,
        friendlyName: num.friendlyName,
        numberType: num.numberType,
        timezone: num.timezone,
        countryCode: num.countryCode,
        status: 'ACTIVE',
        ivrEnabled: num.ivrEnabled,
        ivrFlow: num.ivrFlow,
        voicemailGreeting: num.voicemailGreeting,
      },
    });
    console.log(`  ✅ ${vn.e164Number}  (${vn.friendlyName})`);

    for (const r of num.rules) {
      await prisma.routingRule.create({
        data: {
          virtualNumberId: vn.id,
          label: r.label,
          priority: r.priority,
          activeDays: r.activeDays,
          openTime: r.openTime ?? null,
          closeTime: r.closeTime ?? null,
          action: r.action,
          ringStrategy: r.ringStrategy ?? 'SEQUENTIAL',
          ringTimeout: r.ringTimeout ?? 30,
          destinations: r.destinations,
          sipUri: (r as any).sipUri ?? null,
        },
      });
    }

    // Dense call logs — enterprise = high traffic (30–50 per number)
    const logCount = randInt(30, 50);
    for (let i = 0; i < logCount; i++) {
      const status = pick(CALL_STATUSES);
      const duration = status === 'COMPLETED' ? randInt(30, 900) : null;
      const startedAt = daysAgo(randInt(0, 90), 12);
      await prisma.callLog.create({
        data: {
          virtualNumberId: vn.id,
          userId: admin.id,
          callerNumber: pick(callerPools),
          calledNumber: vn.e164Number,
          forwardedTo: status === 'COMPLETED' ? '+18005550101' : null,
          status,
          duration,
          direction: 'INBOUND',
          startedAt,
          endedAt: duration ? new Date(startedAt.getTime() + duration * 1000) : null,
        },
      });
    }
    console.log(`     ↳ ${logCount} call logs, ${num.rules.length} routing rules`);
  }
}

// ─── AGENT seed (STARTER – max 3 numbers) ────────────────────────────────────

async function seedAgent() {
  const agent = await prisma.user.findUniqueOrThrow({ where: { email: 'agent@example.com' } });

  await prisma.callLog.deleteMany({ where: { userId: agent.id } });
  await prisma.routingRule.deleteMany({ where: { virtualNumber: { userId: agent.id } } });
  await prisma.virtualNumber.deleteMany({ where: { userId: agent.id } });

  const numbers = [
    {
      e164Number: '+17025550310', friendlyName: 'My Business Line',  numberType: 'LOCAL',     timezone: 'America/Los_Angeles', countryCode: 'US',
      voicemailGreeting: 'Hi, you have reached Jordan Smith Consulting. Leave a message and I will get back to you.',
      rules: [
        { label: 'Working Hours',     priority: 0, activeDays: '1,2,3,4,5', openTime: '09:00', closeTime: '18:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 25, destinations: JSON.stringify([{ type: 'PSTN', value: '+17025550311', order: 1 }]) },
        { label: 'Voicemail',         priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
      logCount: 22,
    },
    {
      e164Number: '+17025550320', friendlyName: 'Client Support',    numberType: 'LOCAL',     timezone: 'America/Los_Angeles', countryCode: 'US',
      voicemailGreeting: 'Client support line. Please describe your issue and I will call you back within 24 hours.',
      rules: [
        { label: 'Support Hours',     priority: 0, activeDays: '1,2,3,4,5', openTime: '10:00', closeTime: '16:00', action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 20, destinations: JSON.stringify([{ type: 'PSTN', value: '+17025550321', order: 1 }]) },
        { label: 'Voicemail',         priority: 1, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'VOICEMAIL', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([]) },
      ],
      logCount: 14,
    },
    {
      e164Number: '+18005550330', friendlyName: 'Toll-Free Inquiries', numberType: 'TOLL_FREE', timezone: 'America/Los_Angeles', countryCode: 'US',
      voicemailGreeting: 'Thank you for calling. Please leave your name and number.',
      rules: [
        { label: 'Forward Always',    priority: 0, activeDays: '1,2,3,4,5,6,7', openTime: null, closeTime: null, action: 'FORWARD_PSTN', ringStrategy: 'SEQUENTIAL', ringTimeout: 30, destinations: JSON.stringify([{ type: 'PSTN', value: '+17025550311', order: 1 }]) },
      ],
      logCount: 9,
    },
  ];

  const callerPool = ['+13105550100', '+12125550101', '+19495550102', '+14085550103', '+16505550104'];

  for (const num of numbers) {
    const vn = await prisma.virtualNumber.create({
      data: {
        userId: agent.id,
        e164Number: num.e164Number,
        friendlyName: num.friendlyName,
        numberType: num.numberType,
        timezone: num.timezone,
        countryCode: num.countryCode,
        status: 'ACTIVE',
        voicemailGreeting: num.voicemailGreeting,
      },
    });
    console.log(`  ✅ ${vn.e164Number}  (${vn.friendlyName})`);

    for (const r of num.rules) {
      await prisma.routingRule.create({
        data: {
          virtualNumberId: vn.id,
          label: r.label,
          priority: r.priority,
          activeDays: r.activeDays,
          openTime: r.openTime ?? null,
          closeTime: r.closeTime ?? null,
          action: r.action,
          ringStrategy: r.ringStrategy,
          ringTimeout: r.ringTimeout,
          destinations: r.destinations,
        },
      });
    }

    for (let i = 0; i < num.logCount; i++) {
      const status = pick(CALL_STATUSES);
      const duration = status === 'COMPLETED' ? randInt(45, 360) : null;
      const startedAt = daysAgo(randInt(0, 30), 8);
      await prisma.callLog.create({
        data: {
          virtualNumberId: vn.id,
          userId: agent.id,
          callerNumber: pick(callerPool),
          calledNumber: vn.e164Number,
          forwardedTo: status === 'COMPLETED' ? num.rules[0].destinations ? JSON.parse(num.rules[0].destinations)[0]?.value : null : null,
          status,
          duration,
          direction: 'INBOUND',
          startedAt,
          endedAt: duration ? new Date(startedAt.getTime() + duration * 1000) : null,
        },
      });
    }
    console.log(`     ↳ ${num.logCount} call logs, ${num.rules.length} routing rules`);
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Seeding accounts...\n');

  console.log('👔 Admin (ENTERPRISE):');
  await seedAdmin();

  console.log('\n🧑‍💼 Agent (STARTER):');
  await seedAgent();

  console.log('\n🎉 Done!\n');
  console.log('  admin@example.com  → 9 numbers, ~360 call logs');
  console.log('  agent@example.com  → 3 numbers,  45 call logs\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
