# TollFreeForwarding — Full Project Plan

> **Live URL:** https://tollfreeforwarding-frontend-qtgq.vercel.app  
> **Stack:** Node.js + Express + Prisma + Neon (backend) · React 18 + Vite + Zustand (frontend)  
> **Deployment:** Vercel (both services) · GitHub: https://github.com/rnimriya/tollfreeforwarding

---

## 1. Project Overview

TollFreeForwarding is a cloud-based virtual phone number platform (SaaS). Businesses provision virtual numbers, configure smart call routing rules, build IVR menus, and monitor live call analytics — all without physical phone hardware.

**Core value proposition:**
- Provision US, UK, EU, APAC phone numbers instantly
- Route calls by time of day, day of week, and caller ID
- Visual drag-and-drop IVR builder (no coding required)
- Real-time dashboard with call volume trends and analytics
- Webhook + REST API integration for CRM/helpdesk platforms

---

## 2. Current Architecture

### 2.1 Monorepo Structure
```
tollfreeforwarding/
├── backend/                  Node.js + Express + TypeScript
│   ├── prisma/schema.prisma  Database schema (Neon PostgreSQL)
│   └── src/
│       ├── index.ts          Express app entry + CORS + proxy config
│       ├── lib/              auth, validate, cache, audit, apiError, asyncHandler
│       ├── routes/           auth, numbers, routing, logs, dashboard, webhook
│       └── services/         authService, numberService, routingService
├── frontend/                 React 18 + Vite + TypeScript
│   └── src/
│       ├── pages/            35 pages (app + marketing)
│       ├── stores/           authStore, themeStore (Zustand)
│       ├── lib/              api, format, tokenStorage
│       └── components/       AppLayout, MarketingLayout
└── api/index.ts              Vercel serverless entry shim
```

### 2.2 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 + Neon (serverless PostgreSQL) |
| Auth | JWT (7-day), bcryptjs, rate-limit |
| Cache | In-memory (ICache interface, Redis-swappable) |
| Telephony | Twilio / Plivo TwiML webhook |
| Frontend | React 18, Vite 5, React Router v6 |
| State | Zustand (persisted), TanStack React Query |
| Charts | Recharts |
| IVR Canvas | @xyflow/react (React Flow) |
| Deployment | Vercel (separate frontend + backend projects) |
| Database | Neon (serverless Postgres, pooled connection) |
| Tests | Vitest v2 — 24 unit tests |

### 2.3 Database Schema (current)

```
User                VirtualNumber         RoutingRule
──────────────      ─────────────────     ─────────────────
id (uuid)           id (uuid)             id (uuid)
email (unique)      userId → User         virtualNumberId → VN
passwordHash        e164Number (unique)   priority
firstName           friendlyName          label
lastName            countryCode           activeDays (CSV)
plan                numberType            openTime / closeTime
resetToken          status                action (enum)
resetTokenExpires   timezone              destinations (JSON)
createdAt           voicemailGreeting     ringStrategy
updatedAt           ivrEnabled            ringTimeout
                    ivrFlow (JSON)        sipUri
                    deletedAt (soft)      ivrNodeKey
                                          deletedAt (soft)

CallLog             AuditLog
──────────────      ────────────────
id                  id
virtualNumberId     userId
userId              action
providerCallSid     entityType
direction           entityId
callerNumber        changes (JSON)
calledNumber        createdAt
forwardedTo
status
duration
routingRuleId
startedAt
endedAt
```

### 2.4 API Endpoints (current)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user profile |
| POST | `/api/auth/forgot-password` | Public | Generate reset token |
| POST | `/api/auth/reset-password` | Public | Apply new password |
| GET | `/api/numbers` | JWT | List numbers (paginated) |
| POST | `/api/numbers` | JWT | Provision new number |
| GET | `/api/numbers/:id` | JWT | Number + routing rules |
| PATCH | `/api/numbers/:id` | JWT | Update settings/IVR |
| DELETE | `/api/numbers/:id` | JWT | Soft-delete number |
| GET | `/api/routing/:numberId` | JWT | List routing rules |
| POST | `/api/routing` | JWT | Create routing rule |
| PATCH | `/api/routing/:id` | JWT | Update routing rule |
| DELETE | `/api/routing/:id` | JWT | Soft-delete rule |
| GET | `/api/logs` | JWT | Call logs (filtered, paginated) |
| GET | `/api/dashboard` | JWT | Stats, trends, status breakdown |
| POST | `/webhook/inbound` | HMAC | Twilio/Plivo call handler |
| GET | `/webhook/inbound` | None | Simulation/test endpoint |
| GET | `/health` | None | Uptime probe |

---

## 3. What Is Already Built

### 3.1 Backend — Complete
- [x] User registration + login with bcrypt password hashing
- [x] JWT authentication (7-day expiry, Bearer tokens)
- [x] Timing-safe login (constant-time bcrypt prevents email enumeration)
- [x] Password reset flow (token + expiry)
- [x] Input validation layer (`validate.ts`) for all fields
- [x] Plan enforcement: STARTER=3, PROFESSIONAL=5, ENTERPRISE=∞ numbers
- [x] Virtual number CRUD with soft-delete
- [x] Routing rule CRUD with soft-delete
- [x] Timezone-aware call routing (Luxon — supports overnight windows)
- [x] IVR flow stored as JSON on VirtualNumber
- [x] TwiML XML builder (FORWARD_PSTN, FORWARD_SIP, RING_GROUP, VOICEMAIL, REJECT)
- [x] HMAC-SHA256 webhook signature verification
- [x] Rate limiting (auth: 10/15min, forgot-password: 5/hr)
- [x] Trust proxy (real IPs behind Vercel)
- [x] In-memory cache with TTL + eviction (swappable to Redis)
- [x] Audit log (CREATE/UPDATE/DELETE on numbers and rules)
- [x] Dashboard analytics (total numbers, call volume, avg duration, daily trend, status breakdown)
- [x] Pagination on list endpoints
- [x] CORS restricted to known origins via `ALLOWED_ORIGINS`
- [x] Global error handler + asyncHandler wrapper
- [x] 24 unit tests (validate, auth, webhook)

### 3.2 Frontend — App Pages (Complete)
- [x] Login / Register / Forgot Password / Reset Password
- [x] Dashboard — KPI cards, 7-day call chart, status breakdown
- [x] Numbers list — paginated, provision new number, delete
- [x] Number detail — settings, IVR toggle, voicemail greeting, routing rules
- [x] Routing rule editor — action, schedule, destinations, ring strategy
- [x] Visual IVR Builder — drag-and-drop React Flow canvas, save to DB
- [x] Call Logs — filter by status/number, duration formatting
- [x] Light/dark theme toggle (persisted)
- [x] JWT token + Zustand state (single source of truth via tokenStorage)
- [x] Auto-logout on 401

### 3.3 Frontend — Marketing Pages (Complete)
- [x] Landing page (hero, features, pricing preview, testimonials)
- [x] Features deep-dive page
- [x] Pricing page (Starter $19, Professional $49, Enterprise $149 + annual discount)
- [x] IVR marketing page
- [x] Analytics marketing page
- [x] Webhooks marketing page
- [x] API Docs page (interactive reference)
- [x] Documentation page
- [x] About, Blog, Careers, Press Kit, Affiliates, Community
- [x] Contact, SLA, Status pages
- [x] Links page (bio/link-in-bio style)

---

## 4. What Is Missing (Gap Analysis)

### 4.1 Critical — Breaks Real Production Use

| # | Gap | Impact |
|---|---|---|
| G-1 | **No real telephony integration** — numbers are random local integers, not real Twilio/Plivo provisioned numbers | Users cannot actually receive calls |
| G-2 | **No payment/billing** — plans exist in DB as a string field, no Stripe integration, no upgrade flow | Cannot monetize |
| G-3 | **No call recording** — Professional plan features it but no storage (S3/Cloudflare R2) or Twilio recording callbacks | Key differentiator missing |
| G-4 | **No email sending** — password reset logs link to console, no SMTP/SendGrid/Resend integration | Password reset broken in prod |
| G-5 | **No voicemail storage** — Twilio sends recording URLs after calls but nothing saves them | Voicemail feature is incomplete |

### 4.2 Important — Core UX Gaps

| # | Gap | Impact |
|---|---|---|
| G-6 | **No account settings page** — no way to change name, email, or password inside the app | Friction for real users |
| G-7 | **No plan upgrade UI** — plan is a string in DB, no way to upgrade from Starter → Professional | Revenue blocked |
| G-8 | **No number search by country** — provision modal has no country selector backed by Twilio available number search | Poor UX |
| G-9 | **No real-time call status** — dashboard only shows historical logs, no live active call indicator | Missing for enterprise |
| G-10 | **IVR builder is visual only** — nodes are stored as JSON but the webhook ignores `ivrFlow` and always falls back to routing rules | IVR builder has no effect on actual calls |
| G-11 | **No outbound calling** — PSTN origination, click-to-call, or SIP dialer | Competitor gap |
| G-12 | **No SMS/MMS support** — platform is voice-only | Large market gap |

### 4.3 Security & Ops Gaps

| # | Gap | Impact |
|---|---|---|
| G-13 | **In-memory cache is no-op on Vercel** — serverless functions are stateless, every invocation is a cold DB query | Latency + DB cost at scale |
| G-14 | **No Redis** — `ICache` interface exists but only in-memory impl shipped | Cache misses on every call |
| G-15 | **JWT has no refresh token** — 7-day access token, no rotation, no revocation | Security: stolen tokens live 7 days |
| G-16 | **No admin panel** — no way to manage all users, view usage across accounts, or override plans | Operations blocked |
| G-17 | **No usage metering** — minutes consumed not tracked against plan limits | Plan enforcement is number-count only |
| G-18 | **No soft-delete UI** — deleted numbers/rules are hidden but there is no recycle bin or restore flow | Data loss UX |

---

## 5. Phased Roadmap

### Phase 1 — Make It Real (Weeks 1–3)
**Goal: A paying user can receive a real call.**

| Task | Details |
|---|---|
| Twilio integration | Provision real numbers via `twilio.availablePhoneNumbers().list()` + `incomingPhoneNumbers.create()`. Store Twilio SID on VirtualNumber. |
| Email sending | Integrate Resend (or SendGrid). Send password-reset email, welcome email on register. |
| IVR webhook execution | Implement IVR flow walker in `webhook.ts` — traverse `ivrFlow` JSON nodes when `ivrEnabled=true`. |
| Voicemail storage | Handle Twilio `RecordingUrl` callback. Store in Cloudflare R2/S3. Surface in call logs. |
| Number release | On `deleteNumber`, call `twilio.incomingPhoneNumbers(sid).remove()`. |

**Schema changes needed:**
```sql
ALTER TABLE virtual_numbers ADD COLUMN provider_sid TEXT;
ALTER TABLE virtual_numbers ADD COLUMN provider TEXT DEFAULT 'twilio';
ALTER TABLE call_logs ADD COLUMN recording_url TEXT;
ALTER TABLE call_logs ADD COLUMN voicemail_url TEXT;
```

---

### Phase 2 — Monetize (Weeks 4–6)
**Goal: Stripe subscription billing live, plan gates enforced.**

| Task | Details |
|---|---|
| Stripe integration | `stripe.subscriptions.create()` on plan selection. Store `stripeCustomerId` + `stripeSubscriptionId` on User. |
| Webhook handler `/api/stripe` | Handle `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`. |
| Plan upgrade UI | `/settings/billing` page — current plan, usage meters, upgrade/downgrade buttons. |
| Usage metering | Track minutes consumed per billing period. Gate at plan limit. |
| Trial logic | 14-day trial on register. `trialEndsAt` on User. Reminder emails at day 10 and 13. |

**Schema changes needed:**
```sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN minutes_used_this_period INT DEFAULT 0;
ALTER TABLE users ADD COLUMN billing_period_start TIMESTAMPTZ;
```

**Pricing (as defined in PricingPage):**

| Plan | Monthly | Annual | Numbers | Minutes |
|---|---|---|---|---|
| Starter | $19/mo | $15/mo | 3 | 500 |
| Professional | $49/mo | $39/mo | 5 | 2,000 |
| Enterprise | $149/mo | $119/mo | Unlimited | Unlimited |

---

### Phase 3 — Account & Settings (Week 7)
**Goal: Users can manage their own accounts.**

| Task | Details |
|---|---|
| Profile settings page | Change first/last name, email (re-verify), password. |
| Notification preferences | Email on missed call, voicemail, low-minute warning. |
| API key management | Generate/revoke API keys for HMAC webhook and REST API access. Store hashed keys. |
| Number portability UI | Form to submit porting request (manual ops flow for now). |

**New routes needed:**
```
PATCH  /api/auth/profile          Update name/email
PATCH  /api/auth/password         Change password (requires current)
GET    /api/auth/api-keys         List keys (masked)
POST   /api/auth/api-keys         Generate key
DELETE /api/auth/api-keys/:id     Revoke key
```

---

### Phase 4 — Analytics & Reporting (Weeks 8–9)
**Goal: Dashboard is genuinely useful for business decisions.**

| Task | Details |
|---|---|
| Extended time ranges | 7d / 30d / 90d / custom range on all charts |
| Per-number analytics | Break down calls, answer rate, avg duration by number |
| Geographic heatmap | Recharts or Mapbox — caller area code clustering |
| Call outcome funnel | Answered → Forwarded → Completed vs dropped |
| CSV export | Export call logs to CSV for accounting/compliance |
| Scheduled reports | Weekly email digest with key metrics |

---

### Phase 5 — Enterprise Features (Weeks 10–12)
**Goal: Land enterprise deals.**

| Task | Details |
|---|---|
| SSO / SAML | Auth0 or WorkOS integration — `GET /auth/sso/init`, `POST /auth/sso/callback` |
| Team / sub-accounts | Invite users to an org. Roles: Owner, Admin, Agent (view-only). |
| SLA page live data | `/status` reads real uptime from BetterUptime or StatusPage.io API |
| Custom SIP trunk | BYOC (Bring Your Own Carrier) — user provides SIP credentials, we register them |
| Admin panel | Internal route `/admin` — view all users, override plans, view audit logs, impersonate |
| Redis cache | Replace `MemoryCache` with `ioredis` — same `ICache` interface, zero app changes |

**Schema changes needed:**
```sql
CREATE TABLE organizations (id, name, ownerId, plan, stripeCustomerId, ...);
CREATE TABLE org_members (orgId, userId, role, inviteEmail, inviteStatus, ...);
ALTER TABLE virtual_numbers ADD COLUMN org_id TEXT REFERENCES organizations;
```

---

### Phase 6 — SMS & Outbound (Weeks 13–16)
**Goal: Full communications platform.**

| Task | Details |
|---|---|
| SMS receive | Twilio `POST /webhook/sms` — store in new `SmsLog` table, surface in unified inbox |
| SMS send | `POST /api/sms/send` — Twilio message create, deduct from SMS quota |
| Click-to-call | `POST /api/calls/originate` — Twilio outbound call, forward to agent's number |
| SMS marketing templates | Saved templates, scheduled send, basic campaign log |
| Voicemail transcription | Twilio Intelligence or Deepgram — auto-transcribe voicemail recordings |
| WhatsApp channel | Twilio WhatsApp sandbox → production — adds `channel: 'whatsapp'` to SmsLog |

---

## 6. Technical Debt & Known Bugs

The following bugs were identified and fixed during hardening, but are documented for awareness:

| ID | Status | Description |
|---|---|---|
| BUG-1 | ✅ Fixed | IVR flow never loaded (React hook lifecycle — `useMemo` → `useEffect + ref`) |
| BUG-2 | ✅ Fixed | Login timing attack — unknown emails short-circuited bcrypt |
| BUG-3 | ✅ Fixed | `validateActiveDays([])` vacuously true — empty array matched all days |
| BUG-4 | ✅ Fixed | Rate limiter blocked all users behind Vercel proxy (missing trust proxy) |
| BUG-5 | ✅ Fixed | `JWT_SECRET` falling back to `dev-secret` silently in production |
| BUG-6 | ✅ Fixed | TwiML XML injection via raw `voicemailGreeting` interpolation |
| BUG-7 | ✅ Fixed | E.164 collision threw 500 with no retry (now retries up to 5×) |
| BUG-8 | ✅ Fixed | Webhook served soft-deleted routing rules to live calls |
| BUG-9 | ✅ Fixed | CORS allowed any `*.vercel.app` origin |

**Remaining known issues:**
- In-memory cache is stateless per Vercel invocation — every webhook call hits DB
- JWT has no refresh/revocation — 7-day stolen token is live for full duration
- IVR `ivrFlow` JSON is stored and rendered in the builder, but not yet executed by the webhook engine
- `provisionNumber` generates random E.164 — not a real number (Phase 1 Twilio integration fixes this)
- No email is sent for password reset — reset link is logged to console only

---

## 7. Environment Variables Reference

### Backend (`tollfreeforwarding-backend` on Vercel)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32-char random string for signing tokens |
| `NODE_ENV` | ✅ | `production` |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated CORS origins |
| `FRONTEND_URL` | ✅ | Used in password-reset link |
| `WEBHOOK_SECRET` | Recommended | HMAC secret for Twilio signature verification |
| `TWILIO_ACCOUNT_SID` | Phase 1 | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Phase 1 | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Phase 1 | Default outbound caller ID |
| `STRIPE_SECRET_KEY` | Phase 2 | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Phase 2 | Stripe webhook signing secret |
| `RESEND_API_KEY` | Phase 1 | Email delivery (Resend.com) |
| `REDIS_URL` | Phase 5 | Redis connection (Upstash recommended for Vercel) |

### Frontend (`tollfreeforwarding-frontend-qtgq` on Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Phase 2 | Stripe publishable key for checkout |

---

## 8. Test Accounts

| Email | Password | Plan | Numbers | Description |
|---|---|---|---|---|
| `demo@example.com` | `password123` | PROFESSIONAL | 5 | Demo user — mixed routing, IVR, call logs |
| `admin@example.com` | `password123` | ENTERPRISE | 9 | Large business — global offices, ring groups, SIP |
| `agent@example.com` | `password123` | STARTER | 3 | Freelancer — at plan limit, simple forwarding |

---

## 9. Deployment

```
GitHub push → main branch
   ↓
Vercel auto-deploy (or manual: npx vercel deploy --prod)
   ↓
Backend: tollfreeforwarding-backend.vercel.app
Frontend: tollfreeforwarding-frontend-qtgq.vercel.app
   ↓
Frontend /api/* → rewrites to backend via vercel.json
```

**Manual deploy commands:**
```bash
# Deploy both in parallel
npx vercel deploy --prod --cwd backend --yes &
npx vercel deploy --prod --cwd frontend --yes &
wait

# Re-seed database
node --import tsx/esm backend/src/seed.ts        # demo user
node --import tsx/esm backend/src/seed_accounts.ts  # admin + agent
```

---

## 10. Priority Summary

| Priority | Item | Phase | Effort |
|---|---|---|---|
| 🔴 P0 | Real Twilio number provisioning | 1 | 3 days |
| 🔴 P0 | Email sending (password reset) | 1 | 1 day |
| 🔴 P0 | IVR webhook execution engine | 1 | 2 days |
| 🟠 P1 | Stripe billing + plan upgrade UI | 2 | 5 days |
| 🟠 P1 | Voicemail recording storage | 1 | 2 days |
| 🟡 P2 | Account settings page | 3 | 2 days |
| 🟡 P2 | Extended analytics (ranges, export) | 4 | 3 days |
| 🟢 P3 | Redis cache (Upstash) | 5 | 1 day |
| 🟢 P3 | SSO / SAML | 5 | 4 days |
| 🟢 P3 | Teams / org management | 5 | 5 days |
| 🔵 P4 | SMS receive/send | 6 | 4 days |
| 🔵 P4 | Outbound calling | 6 | 3 days |
| 🔵 P4 | Voicemail transcription | 6 | 2 days |
