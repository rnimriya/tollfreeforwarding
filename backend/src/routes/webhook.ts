import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { DateTime } from 'luxon';

const router = Router();

interface CachedConfig {
  virtualNumberId: string;
  userId: string;
  timezone: string;
  voicemailGreeting: string | null;
  ivrEnabled: boolean;
  ivrFlow: any;
  routingRules: Array<{
    id: string;
    priority: number;
    activeDays: number[];
    openTime: string | null;
    closeTime: string | null;
    action: string;
    destinations: any[];
    ringStrategy: string;
    ringTimeout: number;
    sipUri: string | null;
    ivrNodeKey: string | null;
  }>;
}

async function resolveConfig(e164: string): Promise<CachedConfig | null> {
  const key = `num:${e164}`;
  const cached = cache.get<CachedConfig>(key);
  if (cached) return cached;

  const vn = await prisma.virtualNumber.findUnique({
    where: { e164Number: e164 },
    include: { routingRules: { orderBy: { priority: 'asc' } } },
  });

  if (!vn || vn.status !== 'ACTIVE') return null;

  const config: CachedConfig = {
    virtualNumberId: vn.id,
    userId: vn.userId,
    timezone: vn.timezone,
    voicemailGreeting: vn.voicemailGreeting,
    ivrEnabled: vn.ivrEnabled,
    ivrFlow: vn.ivrFlow ? JSON.parse(vn.ivrFlow) : null,
    routingRules: vn.routingRules.map((r: any) => ({
      id: r.id,
      priority: r.priority,
      activeDays: r.activeDays ? r.activeDays.split(',').map(Number) : [],
      openTime: r.openTime,
      closeTime: r.closeTime,
      action: r.action,
      destinations: (() => { try { return JSON.parse(r.destinations); } catch { return []; } })(),
      ringStrategy: r.ringStrategy,
      ringTimeout: r.ringTimeout,
      sipUri: r.sipUri,
      ivrNodeKey: r.ivrNodeKey,
    })),
  };

  cache.set(key, config, 300);
  return config;
}

function isRuleActive(rule: CachedConfig['routingRules'][number], now: DateTime): boolean {
  const isoWeekday = now.weekday; // 1=Mon … 7=Sun
  if (rule.activeDays.length > 0 && !rule.activeDays.includes(isoWeekday)) return false;

  if (rule.openTime && rule.closeTime) {
    const [oh, om] = rule.openTime.split(':').map(Number);
    const [ch, cm] = rule.closeTime.split(':').map(Number);
    const open = now.set({ hour: oh, minute: om, second: 0, millisecond: 0 });
    const close = now.set({ hour: ch, minute: cm, second: 0, millisecond: 0 });

    if (close <= open) {
      // Overnight window e.g. 22:00–06:00
      if (now >= close && now < open) return false;
    } else {
      if (now < open || now >= close) return false;
    }
  }

  return true;
}

function buildXml(action: string, rule: CachedConfig['routingRules'][number] | null, config: CachedConfig): string {
  if (!rule) {
    const greeting = config.voicemailGreeting || 'Please leave a message after the tone.';
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">${greeting}</Say>
  <Record maxLength="120" playBeep="true" />
</Response>`;
  }

  switch (action) {
    case 'FORWARD_PSTN':
    case 'RING_GROUP': {
      const dests = rule.destinations.slice().sort((a: any, b: any) => a.order - b.order);
      if (rule.ringStrategy === 'SIMULTANEOUS') {
        const numbers = dests.map((d: any) => `  <Number>${d.value}</Number>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${rule.ringTimeout}">\n${numbers}
  </Dial>
</Response>`;
      }
      // SEQUENTIAL - first destination
      const dest = dests[0]?.value || '';
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${rule.ringTimeout}">${dest}</Dial>
</Response>`;
    }

    case 'FORWARD_SIP':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>${rule.sipUri}</Sip>
  </Dial>
</Response>`;

    case 'VOICEMAIL': {
      const greeting = config.voicemailGreeting || 'Please leave a message after the tone.';
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${greeting}</Say>
  <Record maxLength="120" playBeep="true" />
</Response>`;
    }

    case 'REJECT':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Reject reason="busy"/>
</Response>`;

    default:
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }
}

// POST /webhook/inbound - Twilio / Plivo hits this
router.post('/inbound', async (req: Request, res: Response) => {
  const t0 = Date.now();

  // Twilio field: req.body.To | Plivo field: req.body.To
  const calledNumber: string = req.body.To || req.body.to || '';
  const callerNumber: string = req.body.From || req.body.from || 'unknown';
  const callSid: string = req.body.CallSid || req.body.call_uuid || '';

  try {
    const config = await resolveConfig(calledNumber);

    if (!config) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>The number you dialed is not in service.</Say>
  <Hangup/>
</Response>`;
      return res.status(200).type('text/xml').send(xml);
    }

    const nowInTz = DateTime.now().setZone(config.timezone);
    let matchedRule: CachedConfig['routingRules'][number] | null = null;
    for (const rule of config.routingRules) {
      if (isRuleActive(rule, nowInTz)) { matchedRule = rule; break; }
    }

    const xml = buildXml(matchedRule?.action || 'VOICEMAIL', matchedRule, config);

    // Fire-and-forget log write
    setImmediate(async () => {
      await prisma.callLog.create({
        data: {
          virtualNumberId: config.virtualNumberId,
          userId: config.userId,
          providerCallSid: callSid || null,
          callerNumber,
          calledNumber,
          forwardedTo: matchedRule?.destinations?.[0]?.value ?? null,
          status: 'INITIATED',
          routingRuleId: matchedRule?.id ?? null,
          direction: 'INBOUND',
        },
      }).catch(() => {});
    });

    console.log(`[webhook] ${calledNumber} ← ${callerNumber} | rule=${matchedRule?.id ?? 'none'} | ${Date.now() - t0}ms`);
    return res.status(200).type('text/xml').send(xml);
  } catch (err) {
    console.error('[webhook] error:', err);
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error.</Say><Hangup/></Response>`;
    return res.status(200).type('text/xml').send(xml);
  }
});

// GET /webhook/inbound - simulate from browser for testing
router.get('/inbound', async (req: Request, res: Response) => {
  const to = req.query.to as string;
  const from = req.query.from as string || '+15550001234';
  if (!to) return res.status(400).json({ error: 'Pass ?to=+1xxxxxxxxxx' });

  const config = await resolveConfig(to);
  if (!config) return res.json({ error: 'Number not found or inactive' });

  const nowInTz = DateTime.now().setZone(config.timezone);
  let matchedRule: CachedConfig['routingRules'][number] | null = null;
  for (const rule of config.routingRules) {
    if (isRuleActive(rule, nowInTz)) { matchedRule = rule; break; }
  }

  return res.json({
    number: to,
    timezone: config.timezone,
    localTime: nowInTz.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'),
    matchedRule: matchedRule ? { id: matchedRule.id, action: matchedRule.action, priority: matchedRule.priority } : null,
    twiml: buildXml(matchedRule?.action || 'VOICEMAIL', matchedRule, config),
  });
});

export default router;
