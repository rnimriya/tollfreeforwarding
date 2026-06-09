import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import authRouter from './routes/auth.js';
import numbersRouter from './routes/numbers.js';
import routingRouter from './routes/routing.js';
import logsRouter from './routes/logs.js';
import webhookRouter from './routes/webhook.js';
import dashboardRouter from './routes/dashboard.js';
import billingRouter from './routes/billing.js';
import adminRouter from './routes/admin.js';
import smsRouter from './routes/sms.js';
import callsRouter from './routes/calls.js';
import { errorHandler } from './lib/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3009;

app.set('trust proxy', 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

const vercelPrefix = process.env.VERCEL_APP_PREFIX;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (vercelPrefix) {
        try {
          const { hostname } = new URL(origin);
          if (hostname === `${vercelPrefix}.vercel.app` || hostname.startsWith(`${vercelPrefix}-`)) {
            return callback(null, true);
          }
        } catch (_) {}
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Raw body parser for Stripe webhook (must come before express.json)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public webhook (no auth — Twilio/Plivo hits these)
app.use('/webhook', webhookRouter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/numbers', numbersRouter);
app.use('/api/routing', routingRouter);
app.use('/api/logs', logsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/billing', billingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sms', smsRouter);
app.use('/api/calls', callsRouter);

app.use(errorHandler);

app.get('/', (_req, res) => res.json({ message: 'CloudPBX API is running' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
    console.log(`📞 Webhook endpoint: http://localhost:${PORT}/webhook/inbound`);
    console.log(`🗄️  Prisma Studio: pnpm db:studio\n`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
