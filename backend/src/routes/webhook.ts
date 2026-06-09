import { Router, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { DateTime } from 'luxon';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/apiError.js';
import { sendMissedCallAlert, sendVoicemailAlert, sendLowMinutesWarning } from '../lib/email.js';
import { PLAN_MINUTE_LIMITS } from '../lib/stripe.js';

const router = Router();

interface CachedConfig {
  virtualNumberId: string;
  userId: string;
  userEmail: string;
  userName: string;
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
    include: {
      routingRules: { where: { deletedAt: null }, orderBy: { priority: 'asc' } },
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  if (!vn || vn.status !== 'ACTIVE') return null;

  const config: CachedConfig = {
    virtualNumberId: vn.id,
    userId: vn.userId,
    userEmail: (vn as any).user.email,
    userName: `${(vn as any).user.firstName} ${(vn as any).user.lastName}`.trim(),
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
  const isoWeekday = now.weekday;

  if (!rule.openTime || !rule.closeTime) {
    if (rule.activeDays.length > 0 && !rule.activeDays.includes(isoWeekday)) return false;
    return true;
  }

  const [oh, om] = rule.openTime.split(':').map(Number);
  const [ch, cm] = rule.closeTime.split(':').map(Number);

  const checkShift = (refDay: DateTime): boolean => {
    const refWeekday = refDay.weekday;
    if (rule.activeDays.length > 0 && !rule.activeDays.includes(refWeekday)) return false;

    const open = refDay.set({ hour: oh, minute: om, second: 0, millisecond: 0 });
    let close = refDay.set({ hour: ch, minute: cm, second: 0, millisecond: 0 });

    if (ch < oh || (ch === oh && cm <= om)) {
      close = close.plus({ days: 1 });
    }

    return now >= open && now < close;
  };

  return checkShift(now) || checkShift(now.minus({ days: 1 }));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// G-10: Build TwiML for a single IVR node
function buildIvrNodeXml(
  node: any,
  flow: { nodes: any[]; edges: any[] },
  calledNumber: string,
  webhookBase: string
): string {
  const docHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  if (!node) {
    return `${docHeader}<Response><Hangup/></Response>`;
  }

  const { nodeType = 'greeting', text = '', phone = '', options = [] } = node.data || {};
  const nodeId = node.id;

  switch (nodeType) {
    case 'greeting': {
      // Find next node from outgoing edge
      const edge = (flow.edges || []).find((e: any) => e.source === nodeId);
      const nextNode = edge ? (flow.nodes || []).find((n: any) => n.id === edge.target) : null;
      const actionUrl = nextNode
        ? `${webhookBase}/webhook/ivr?vn=${encodeURIComponent(calledNumber)}&node=${nextNode.id}`
        : `${webhookBase}/webhook/ivr?vn=${encodeURIComponent(calledNumber)}&node=voicemail`;

      return `${docHeader}
<Response>
  <Say voice="Polly.Joanna" language="en-US">${escapeXml(text || 'Welcome. Please hold.')}</Say>
  <Redirect>${escapeXml(actionUrl)}</Redirect>
</Response>`;
    }

    case 'menu': {
      const gatherAction = `${webhookBase}/webhook/ivr?vn=${encodeURIComponent(calledNumber)}&node=${nodeId}&gather=1`;
      const menuItems = (options as any[]).map((opt: any) =>
        `  <Say voice="Polly.Joanna">Press ${escapeXml(String(opt.digit))} for ${escapeXml(opt.label || '')}.</Say>`
      ).join('\n');

      return `${docHeader}
<Response>
  <Gather numDigits="1" action="${escapeXml(gatherAction)}" method="POST">
    <Say voice="Polly.Joanna">${escapeXml(text || 'Please select from the following options.')}</Say>
${menuItems}
  </Gather>
  <Say voice="Polly.Joanna">We did not receive your selection. Goodbye.</Say>
  <Hangup/>
</Response>`;
    }

    case 'forward': {
      return `${docHeader}
<Response>
  <Dial timeout="30">${escapeXml(phone || '')}</Dial>
</Response>`;
    }

    case 'voicemail': {
      const greeting = escapeXml(text || 'Please leave a message after the tone.');
      const recordAction = `${webhookBase}/webhook/recording?vn=${encodeURIComponent(calledNumber)}`;
      return `${docHeader}
<Response>
  <Say voice="Polly.Joanna">${greeting}</Say>
  <Record maxLength="120" playBeep="true" action="${escapeXml(recordAction)}" />
</Response>`;
    }

    case 'hangup':
    default:
      return `${docHeader}<Response><Say>${escapeXml(text || 'Thank you for calling. Goodbye.')}</Say><Hangup/></Response>`;
  }
}

// Build TwiML for routing-rule-based calls (non-IVR path)
function buildXml(action: string, rule: CachedConfig['routingRules'][number] | null, config: CachedConfig, webhookBase: string): string {
  const docHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const statusCallback = `${webhookBase}/webhook/status`;
  const recordAction = `${webhookBase}/webhook/recording?vn=${encodeURIComponent(config.virtualNumberId)}`;

  if (!rule) {
    const greeting = escapeXml(config.voicemailGreeting || 'Please leave a message after the tone.');
    return `${docHeader}
<Response>
  <Say voice="Polly.Joanna" language="en-US">${greeting}</Say>
  <Record maxLength="120" playBeep="true" action="${escapeXml(recordAction)}" />
</Response>`;
  }

  switch (action) {
    case 'FORWARD_PSTN':
    case 'RING_GROUP': {
      const dests = rule.destinations.slice().sort((a: any, b: any) => a.order - b.order);
      if (rule.ringStrategy === 'SIMULTANEOUS') {
        const numbers = dests.map((d: any) => `  <Number>${escapeXml(String(d.value))}</Number>`).join('\n');
        return `${docHeader}
<Response>
  <Dial timeout="${rule.ringTimeout}" action="${escapeXml(statusCallback)}">\n${numbers}
  </Dial>
</Response>`;
      }
      const dest = escapeXml(String(dests[0]?.value || ''));
      return `${docHeader}
<Response>
  <Dial timeout="${rule.ringTimeout}" action="${escapeXml(statusCallback)}">${dest}</Dial>
</Response>`;
    }

    case 'FORWARD_SIP':
      return `${docHeader}
<Response>
  <Dial action="${escapeXml(statusCallback)}">
    <Sip>${escapeXml(String(rule.sipUri || ''))}</Sip>
  </Dial>
</Response>`;

    case 'VOICEMAIL': {
      const greeting = escapeXml(config.voicemailGreeting || 'Please leave a message after the tone.');
      return `${docHeader}
<Response>
  <Say voice="Polly.Joanna">${greeting}</Say>
  <Record maxLength="120" playBeep="true" action="${escapeXml(recordAction)}" />
</Response>`;
    }

    case 'REJECT':
      return `${docHeader}
<Response>
  <Reject reason="busy"/>
</Response>`;

    default:
      return `${docHeader}
<Response>
  <Say>Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }
}

function verifyWebhookSignature(req: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const signature = req.headers['x-cpbx-signature'] as string | undefined;
  if (!signature) return false;

  const to: string = req.body?.To || req.body?.to || '';
  const from: string = req.body?.From || req.body?.from || '';
  const sid: string = req.body?.CallSid || req.body?.call_uuid || '';
  const expected = createHmac('sha256', secret).update(`${to}${from}${sid}`).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// POST /webhook/inbound — Twilio / Plivo triggers this
router.post(
  '/inbound',
  asyncHandler(async (req: Request, res: Response) => {
    const t0 = Date.now();

    if (!verifyWebhookSignature(req)) {
      throw ApiError.unauthorized('Invalid callback signature');
    }

    const calledNumber: string = req.body.To || req.body.to || '';
    const callerNumber: string = req.body.From || req.body.from || 'unknown';
    const callSid: string = req.body.CallSid || req.body.call_uuid || '';

    const config = await resolveConfig(calledNumber);

    if (!config) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>The number you dialed is not in service.</Say>
  <Hangup/>
</Response>`;
      return res.status(200).type('text/xml').send(xml);
    }

    const webhookBase = process.env.BACKEND_URL || 'https://tollfreeforwarding-backend.vercel.app';

    // G-10: IVR path takes priority if enabled
    if (config.ivrEnabled && config.ivrFlow) {
      const flow = config.ivrFlow;
      const nodes: any[] = flow.nodes || [];
      const edges: any[] = flow.edges || [];

      // Find entry node (no incoming edges, or first node)
      const targetIds = new Set(edges.map((e: any) => e.target));
      const entryNode = nodes.find((n: any) => !targetIds.has(n.id)) || nodes[0];

      if (entryNode) {
        const xml = buildIvrNodeXml(entryNode, flow, calledNumber, webhookBase);

        setImmediate(async () => {
          await prisma.callLog.create({
            data: {
              virtualNumberId: config.virtualNumberId,
              userId: config.userId,
              providerCallSid: callSid || null,
              callerNumber,
              calledNumber,
              status: 'INITIATED',
              direction: 'INBOUND',
            },
          }).catch((e) => console.error('[webhook] Failed to create call log:', e));
        });

        return res.status(200).type('text/xml').send(xml);
      }
    }

    // Standard routing rule path
    const nowInTz = DateTime.now().setZone(config.timezone);
    let matchedRule: CachedConfig['routingRules'][number] | null = null;
    for (const rule of config.routingRules) {
      if (isRuleActive(rule, nowInTz)) {
        matchedRule = rule;
        break;
      }
    }

    const xml = buildXml(matchedRule?.action || 'VOICEMAIL', matchedRule, config, webhookBase);

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
      }).catch((e) => console.error('[webhook-logs] Failed to create call log:', e));
    });

    console.log(`[webhook] ${calledNumber} ← ${callerNumber} | rule=${matchedRule?.id ?? 'none'} | ${Date.now() - t0}ms`);
    return res.status(200).type('text/xml').send(xml);
  })
);

// GET /webhook/inbound — browser test simulation
router.get(
  '/inbound',
  asyncHandler(async (req: Request, res: Response) => {
    const to = req.query.to as string;
    const from = (req.query.from as string) || '+15550001234';
    if (!to) throw ApiError.badRequest('Pass ?to=+1xxxxxxxxxx parameter');

    const config = await resolveConfig(to);
    if (!config) throw ApiError.notFound('Virtual number not found or inactive');

    const webhookBase = process.env.BACKEND_URL || 'https://tollfreeforwarding-backend.vercel.app';
    const nowInTz = DateTime.now().setZone(config.timezone);
    let matchedRule: CachedConfig['routingRules'][number] | null = null;
    for (const rule of config.routingRules) {
      if (isRuleActive(rule, nowInTz)) { matchedRule = rule; break; }
    }

    return res.json({
      number: to,
      timezone: config.timezone,
      localTime: nowInTz.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'),
      ivrEnabled: config.ivrEnabled,
      matchedRule: matchedRule ? { id: matchedRule.id, action: matchedRule.action, priority: matchedRule.priority } : null,
      twiml: buildXml(matchedRule?.action || 'VOICEMAIL', matchedRule, config, webhookBase),
    });
  })
);

// G-10: POST /webhook/ivr — IVR digit handler
router.post(
  '/ivr',
  asyncHandler(async (req: Request, res: Response) => {
    const vn = req.query.vn as string;
    const nodeId = req.query.node as string;
    const isGather = req.query.gather === '1';
    const digit = req.body.Digits || req.body.digits || '';

    const config = await resolveConfig(vn);
    if (!config || !config.ivrFlow) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;
      return res.status(200).type('text/xml').send(xml);
    }

    const flow = config.ivrFlow;
    const nodes: any[] = flow.nodes || [];
    const edges: any[] = flow.edges || [];
    const webhookBase = process.env.BACKEND_URL || 'https://tollfreeforwarding-backend.vercel.app';

    let targetNodeId = nodeId;

    if (isGather && digit) {
      // Find edge labeled with the pressed digit
      const currentNode = nodes.find((n: any) => n.id === nodeId);
      const options: any[] = currentNode?.data?.options || [];
      const match = options.find((o: any) => String(o.digit) === String(digit));
      if (match?.nextNodeId) {
        targetNodeId = match.nextNodeId;
      } else {
        // Also check edge labels
        const edge = edges.find((e: any) => e.source === nodeId && e.label === digit);
        if (edge) targetNodeId = edge.target;
      }
    }

    // Special built-in nodes
    if (targetNodeId === 'voicemail') {
      const greeting = escapeXml(config.voicemailGreeting || 'Please leave a message after the tone.');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${greeting}</Say>
  <Record maxLength="120" playBeep="true" />
</Response>`;
      return res.status(200).type('text/xml').send(xml);
    }

    const targetNode = nodes.find((n: any) => n.id === targetNodeId);
    const xml = buildIvrNodeXml(targetNode || null, flow, vn, webhookBase);
    return res.status(200).type('text/xml').send(xml);
  })
);

// POST /webhook/sms — G-12: Inbound SMS from Twilio
router.post(
  '/sms',
  asyncHandler(async (req: Request, res: Response) => {
    const toNumber: string = req.body.To || req.body.to || '';
    const fromNumber: string = req.body.From || req.body.from || '';
    const body: string = req.body.Body || req.body.body || '';
    const sid: string = req.body.MessageSid || req.body.message_uuid || '';

    if (!toNumber || !fromNumber) {
      return res.status(200).type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response/>');
    }

    const vn = await prisma.virtualNumber.findUnique({
      where: { e164Number: toNumber },
      include: { user: { select: { id: true } } },
    });

    if (vn && vn.status === 'ACTIVE') {
      setImmediate(async () => {
        await prisma.smsLog.create({
          data: {
            virtualNumberId: vn.id,
            userId: (vn as any).user.id,
            direction: 'INBOUND',
            fromNumber,
            toNumber,
            body,
            status: 'RECEIVED',
            providerSid: sid || null,
          },
        }).catch((e) => console.error('[webhook-sms] Failed to log inbound SMS:', e));
      });
    }

    return res.status(200).type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response/>');
  })
);

// POST /webhook/status — G-17: Call status callback (deduct minutes, missed call alert)
router.post(
  '/status',
  asyncHandler(async (req: Request, res: Response) => {
    const callSid: string = req.body.CallSid || req.body.call_uuid || '';
    const callStatus: string = req.body.CallStatus || req.body.call_status || '';
    const durationSecs: number = parseInt(req.body.CallDuration || req.body.duration || '0', 10) || 0;

    if (!callSid) { return res.status(200).json({ ok: true }); }

    const log = await prisma.callLog.findFirst({ where: { providerCallSid: callSid } });
    if (!log) { return res.status(200).json({ ok: true }); }

    const statusMap: Record<string, string> = {
      completed: 'COMPLETED',
      busy: 'NO_ANSWER',
      'no-answer': 'NO_ANSWER',
      failed: 'FAILED',
      canceled: 'FAILED',
    };

    const newStatus = statusMap[callStatus] || callStatus.toUpperCase();

    await prisma.callLog.update({
      where: { id: log.id },
      data: {
        status: newStatus,
        duration: durationSecs || null,
        endedAt: new Date(),
      },
    });

    if (newStatus === 'COMPLETED' && durationSecs > 0) {
      // G-17: Deduct minutes
      const minutesUsed = Math.ceil(durationSecs / 60);
      const user = await prisma.user.update({
        where: { id: log.userId },
        data: { minutesUsedThisPeriod: { increment: minutesUsed } },
      });

      // Check if low on minutes (< 10% remaining) and send warning email
      const limit = PLAN_MINUTE_LIMITS[user.plan] ?? 500;
      if (isFinite(limit)) {
        const pctUsed = user.minutesUsedThisPeriod / limit;
        if (pctUsed >= 0.9 && (user.minutesUsedThisPeriod - minutesUsed) / limit < 0.9) {
          sendLowMinutesWarning(user.email, user.firstName || 'there', user.minutesUsedThisPeriod, limit, user.plan)
            .catch(() => {});
        }
      }
    }

    if (newStatus === 'NO_ANSWER' || newStatus === 'FAILED') {
      // G-17: Send missed call alert
      const user = await prisma.user.findUnique({ where: { id: log.userId } });
      if (user) {
        sendMissedCallAlert(user.email, user.firstName || 'there', log.callerNumber, log.calledNumber)
          .catch(() => {});
      }
    }

    return res.status(200).json({ ok: true });
  })
);

// POST /webhook/recording — G-17: Recording/voicemail callback
router.post(
  '/recording',
  asyncHandler(async (req: Request, res: Response) => {
    const callSid: string = req.body.CallSid || '';
    const recordingUrl: string = req.body.RecordingUrl || '';
    const recordingSid: string = req.body.RecordingSid || '';
    const vn = req.query.vn as string | undefined;

    if (callSid) {
      const log = await prisma.callLog.findFirst({ where: { providerCallSid: callSid } });
      if (log) {
        const fullUrl = recordingUrl ? `${recordingUrl}.mp3` : null;
        await prisma.callLog.update({
          where: { id: log.id },
          data: {
            voicemailUrl: fullUrl,
            status: 'VOICEMAIL',
          },
        });

        // Send voicemail alert email
        const user = await prisma.user.findUnique({ where: { id: log.userId } });
        if (user && fullUrl) {
          sendVoicemailAlert(user.email, user.firstName || 'there', log.callerNumber, fullUrl)
            .catch(() => {});
        }
      }
    } else if (vn) {
      // No CallSid — look up by virtual number and most recent INITIATED call
      const number = await prisma.virtualNumber.findUnique({ where: { e164Number: vn } });
      if (number) {
        const recentLog = await prisma.callLog.findFirst({
          where: { virtualNumberId: number.id, status: 'INITIATED' },
          orderBy: { startedAt: 'desc' },
        });
        if (recentLog) {
          const fullUrl = recordingUrl ? `${recordingUrl}.mp3` : null;
          await prisma.callLog.update({
            where: { id: recentLog.id },
            data: { voicemailUrl: fullUrl, status: 'VOICEMAIL' },
          });
          const user = await prisma.user.findUnique({ where: { id: recentLog.userId } });
          if (user && fullUrl) {
            sendVoicemailAlert(user.email, user.firstName || 'there', recentLog.callerNumber, fullUrl)
              .catch(() => {});
          }
        }
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response/>`;
    return res.status(200).type('text/xml').send(xml);
  })
);

export default router;
