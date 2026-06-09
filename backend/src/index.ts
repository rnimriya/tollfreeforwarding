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
import { errorHandler } from './lib/errorHandler.js';

// Trigger Vercel redeployment
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow if no origin (e.g., mobile apps, curl) or if it's in the allowedOrigins list.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Dynamically allow same-origin requests or Vercel preview/production deployments.
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (_) {}

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public webhook (no auth - Twilio hits this)
app.use('/webhook', webhookRouter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/numbers', numbersRouter);
app.use('/api/routing', routingRouter);
app.use('/api/logs', logsRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(errorHandler);

app.get('/api/db-test', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as val`;
    return res.json({ status: 'connected', result });
  } catch (e: any) {
    return res.status(500).json({ error: errToJson(e) });
  }
});

function errToJson(err: any) {
  return {
    message: err.message,
    name: err.name,
    code: err.code,
    clientVersion: err.clientVersion,
    stack: err.stack
  };
}

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
