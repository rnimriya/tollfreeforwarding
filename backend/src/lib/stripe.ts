// G-2, G-7: Stripe billing integration with mock fallback.

export const PLAN_PRICES: Record<string, { monthly: string; annual: string; name: string; amount: number }> = {
  STARTER:      { monthly: process.env.STRIPE_STARTER_MONTHLY  || 'price_starter_monthly',  annual: process.env.STRIPE_STARTER_ANNUAL  || 'price_starter_annual',  name: 'Starter',      amount: 1900 },
  PROFESSIONAL: { monthly: process.env.STRIPE_PRO_MONTHLY      || 'price_pro_monthly',      annual: process.env.STRIPE_PRO_ANNUAL      || 'price_pro_annual',      name: 'Professional', amount: 4900 },
  ENTERPRISE:   { monthly: process.env.STRIPE_ENT_MONTHLY      || 'price_ent_monthly',      annual: process.env.STRIPE_ENT_ANNUAL      || 'price_ent_annual',      name: 'Enterprise',   amount: 14900 },
};

export const PLAN_MINUTE_LIMITS: Record<string, number> = {
  STARTER: 500,
  PROFESSIONAL: 2000,
  ENTERPRISE: Infinity,
};

function hasStripe() {
  return !!process.env.STRIPE_SECRET_KEY;
}

function stripe() {
  if (!hasStripe()) throw new Error('Stripe not configured');
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
}

// Create or retrieve Stripe customer for user
export async function getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
  if (!hasStripe()) return `mock_customer_${userId}`;

  const s = stripe();
  const existing = await s.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await s.customers.create({ email, name, metadata: { userId } });
  return customer.id;
}

// Create Stripe checkout session for plan upgrade
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  if (!hasStripe()) {
    return `${successUrl}?mock=true`;
  }

  const session = await stripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session.url!;
}

// Create billing portal session
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  if (!hasStripe()) return returnUrl;

  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// Parse Stripe webhook event
export function constructWebhookEvent(payload: string | Buffer, signature: string): any {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !hasStripe()) return null;
  try {
    return stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return null;
  }
}

export const stripeEnabled = hasStripe;
