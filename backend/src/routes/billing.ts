// G-2, G-7: Stripe billing routes
import { Router, Request, Response } from 'express';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import {
  PLAN_PRICES, PLAN_MINUTE_LIMITS,
  getOrCreateCustomer, createCheckoutSession, createPortalSession,
  constructWebhookEvent, stripeEnabled,
} from '../lib/stripe.js';

const router = Router();

// GET /api/billing/plans — public plan info
router.get('/plans', (_req, res) => {
  res.json({
    plans: [
      { id: 'STARTER',      name: 'Starter',      monthlyPrice: 19,  annualPrice: 15,  numbers: 3,         minutes: 500,      features: ['3 virtual numbers', '500 minutes/mo', 'Call routing', 'Call logs (30d)', 'Email support'] },
      { id: 'PROFESSIONAL', name: 'Professional',  monthlyPrice: 49,  annualPrice: 39,  numbers: 5,         minutes: 2000,     features: ['5 virtual numbers', '2,000 minutes/mo', 'Visual IVR builder', 'Call recording', 'Analytics', 'API access', 'Priority support'] },
      { id: 'ENTERPRISE',   name: 'Enterprise',    monthlyPrice: 149, annualPrice: 119, numbers: Infinity,  minutes: Infinity, features: ['Unlimited numbers', 'Unlimited minutes', 'Custom SIP trunks', 'SSO/SAML', 'SLA guarantee', '24/7 phone support'] },
    ],
    stripeEnabled: stripeEnabled(),
  });
});

// GET /api/billing/usage — current period usage
router.get('/usage', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const minuteLimit = PLAN_MINUTE_LIMITS[user.plan] ?? 500;
  const minutesUsed = user.minutesUsedThisPeriod;
  const minutesLeft = minuteLimit === Infinity ? Infinity : Math.max(0, minuteLimit - minutesUsed);

  const numberCount = await prisma.virtualNumber.count({ where: { userId, deletedAt: null } });

  res.json({
    plan: user.plan,
    minutesUsed,
    minuteLimit: minuteLimit === Infinity ? null : minuteLimit,
    minutesLeft: minutesLeft === Infinity ? null : minutesLeft,
    numberCount,
    trialEndsAt: user.trialEndsAt,
    billingPeriodStart: user.billingPeriodStart,
    stripeSubscriptionId: user.stripeSubscriptionId,
  });
}));

// POST /api/billing/checkout — create Stripe checkout session to upgrade plan
router.post('/checkout', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { plan, interval = 'monthly' } = req.body;

  if (!PLAN_PRICES[plan]) throw ApiError.badRequest('Invalid plan');

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!stripeEnabled()) {
    // Mock: just update the plan directly
    await prisma.user.update({ where: { id: userId }, data: { plan } });
    return res.json({ url: null, mock: true, message: `Plan updated to ${plan} (mock mode — Stripe not configured)` });
  }

  const customerId = await getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
  await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });

  const priceId = interval === 'annual' ? PLAN_PRICES[plan].annual : PLAN_PRICES[plan].monthly;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url = await createCheckoutSession(
    customerId,
    priceId,
    `${frontendUrl}/settings/billing?success=true`,
    `${frontendUrl}/settings/billing?cancelled=true`,
  );

  res.json({ url });
}));

// POST /api/billing/portal — Stripe billing portal (manage subscription)
router.post('/portal', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.stripeCustomerId || !stripeEnabled()) {
    return res.json({ url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/billing` });
  }

  const url = await createPortalSession(
    user.stripeCustomerId,
    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/billing`,
  );

  res.json({ url });
}));

// POST /api/billing/webhook — Stripe webhook (raw body required)
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const event = constructWebhookEvent(req.body, sig);

  if (!event) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as any;
      const customerId = sub.customer;
      const priceId = sub.items.data[0]?.price?.id;

      let plan = 'STARTER';
      for (const [p, prices] of Object.entries(PLAN_PRICES)) {
        if (prices.monthly === priceId || prices.annual === priceId) { plan = p; break; }
      }

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan, stripeSubscriptionId: sub.id, billingPeriodStart: new Date(sub.current_period_start * 1000) },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer },
        data: { plan: 'STARTER', stripeSubscriptionId: null },
      });
      break;
    }

    case 'invoice.payment_succeeded': {
      const inv = event.data.object as any;
      // Reset monthly minutes on successful billing
      await prisma.user.updateMany({
        where: { stripeCustomerId: inv.customer },
        data: { minutesUsedThisPeriod: 0, billingPeriodStart: new Date() },
      });
      break;
    }
  }

  res.json({ received: true });
}));

export default router;
