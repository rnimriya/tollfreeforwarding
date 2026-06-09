import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { ApiError } from '../lib/apiError.js';
import { validateNumberType } from '../lib/validate.js';
import { writeAudit } from '../lib/audit.js';
import {
  searchAvailableNumbers as twilioSearch,
  provisionNumber as twilioProvision,
  releaseNumber as twilioRelease,
  twilioEnabled,
} from '../lib/twilio.js';

// Number of virtual numbers allowed per plan
const PLAN_LIMITS: Record<string, number> = {
  STARTER: 3,
  PROFESSIONAL: 10,
  ENTERPRISE: Infinity,
};

export class NumberService {
  static async listNumbers(userId: string, page = 1, limit = 50) {
    const take = Math.min(100, limit);
    const skip = (Math.max(1, page) - 1) * take;

    const [total, numbers] = await Promise.all([
      prisma.virtualNumber.count({ where: { userId, deletedAt: null } }),
      prisma.virtualNumber.findMany({
        where: { userId, deletedAt: null },
        include: { _count: { select: { callLogs: true, routingRules: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { total, page: Math.max(1, page), limit: take, data: numbers };
  }

  static async getNumberDetails(id: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id, userId, deletedAt: null },
      include: { routingRules: { where: { deletedAt: null }, orderBy: { priority: 'asc' } } },
    });
    if (!vn) throw ApiError.notFound('Virtual number not found');
    return vn;
  }

  // G-8: Search available numbers from Twilio (or mock)
  static async searchAvailableNumbers(params: { country?: string; numberType?: string; areaCode?: string; limit?: number }) {
    const country = params.country || 'US';
    const numberType = params.numberType || 'LOCAL';
    const limit = Math.min(20, params.limit || 10);

    if (twilioEnabled()) {
      return twilioSearch(country, numberType as any, params.areaCode, limit);
    }

    // Mock: generate random available numbers
    const numbers = Array.from({ length: limit }, (_, i) => {
      const area = params.areaCode || String(200 + Math.floor(Math.random() * 800));
      const line = String(1000000 + Math.floor(Math.random() * 9000000));
      return {
        e164: `+1${area}${line}`,
        friendlyName: `(${area}) ${line.slice(0, 3)}-${line.slice(3)}`,
        capabilities: { voice: true, sms: true, mms: false },
        locality: 'Mock City',
        region: 'CA',
        country,
        numberType,
      };
    });
    return numbers;
  }

  static async provisionNumber(userId: string, reqBody: any) {
    const {
      friendlyName,
      countryCode = 'US',
      timezone = 'America/New_York',
      e164Number: requestedE164,
    } = reqBody;
    const numberType = reqBody.numberType ? validateNumberType(reqBody.numberType) : 'LOCAL';

    // Enforce plan limits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const planLimit = PLAN_LIMITS[user?.plan ?? 'STARTER'] ?? PLAN_LIMITS.STARTER;
    const existingCount = await prisma.virtualNumber.count({ where: { userId, deletedAt: null } });
    if (existingCount >= planLimit) {
      throw ApiError.forbidden(
        `Your ${user?.plan ?? 'STARTER'} plan allows up to ${planLimit} virtual number${planLimit === 1 ? '' : 's'}. Upgrade to add more.`
      );
    }

    let e164: string;
    let providerSid: string | undefined;
    let provider = 'mock';

    if (twilioEnabled() && requestedE164) {
      // Provision via Twilio
      const webhookBase = process.env.BACKEND_URL || 'https://tollfreeforwarding-backend.vercel.app';
      const result = await twilioProvision(requestedE164, webhookBase);
      e164 = result.phoneNumber;
      providerSid = result.sid;
      provider = result.provider;
    } else {
      // Retry up to 5 times to handle rare E.164 unique-constraint collision (P2002).
      const MAX_ATTEMPTS = 5;
      let generated: string | null = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const area = Math.floor(200 + Math.random() * 800);
        const line = Math.floor(1000000 + Math.random() * 9000000);
        const candidate = `+1${area}${line}`;
        const collision = await prisma.virtualNumber.findUnique({ where: { e164Number: candidate } });
        if (!collision) { generated = candidate; break; }
      }
      if (!generated) throw new ApiError(500, 'Failed to generate a unique number — please try again');
      e164 = generated;
    }

    // Retry DB insert up to 3 times (concurrent race condition safety)
    const MAX_DB_ATTEMPTS = 3;
    let vn: Awaited<ReturnType<typeof prisma.virtualNumber.create>> | null = null;
    for (let attempt = 1; attempt <= MAX_DB_ATTEMPTS; attempt++) {
      try {
        vn = await prisma.virtualNumber.create({
          data: {
            userId,
            e164Number: e164,
            friendlyName: friendlyName || `My Number`,
            countryCode,
            numberType,
            timezone,
            status: 'ACTIVE',
            providerSid: providerSid ?? null,
            provider,
          },
        });
        break;
      } catch (err: any) {
        if (err?.code !== 'P2002' || attempt === MAX_DB_ATTEMPTS) throw err;
      }
    }
    if (!vn) throw new ApiError(500, 'Failed to provision a unique number — please try again');

    await writeAudit(userId, 'CREATE', 'VirtualNumber', vn.id, { e164: vn.e164Number, friendlyName: vn.friendlyName, provider });
    return vn;
  }

  static async updateNumberSettings(id: string, userId: string, reqBody: any) {
    const vn = await prisma.virtualNumber.findFirst({ where: { id, userId, deletedAt: null } });
    if (!vn) throw ApiError.notFound('Virtual number not found');

    if (reqBody.numberType) validateNumberType(reqBody.numberType);

    const updated = await prisma.virtualNumber.update({
      where: { id },
      data: {
        friendlyName: reqBody.friendlyName ?? vn.friendlyName,
        timezone: reqBody.timezone ?? vn.timezone,
        ivrEnabled: reqBody.ivrEnabled ?? vn.ivrEnabled,
        ivrFlow: reqBody.ivrFlow ? JSON.stringify(reqBody.ivrFlow) : vn.ivrFlow,
        voicemailGreeting: reqBody.voicemailGreeting ?? vn.voicemailGreeting,
        status: reqBody.status ?? vn.status,
      },
    });

    cache.del(`num:${vn.e164Number}`);
    await writeAudit(userId, 'UPDATE', 'VirtualNumber', id, reqBody);
    return updated;
  }

  static async deleteNumber(id: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({ where: { id, userId, deletedAt: null } });
    if (!vn) throw ApiError.notFound('Virtual number not found');

    // Release from Twilio if provisioned there
    if (vn.provider === 'twilio' && vn.providerSid && twilioEnabled()) {
      await twilioRelease(vn.providerSid).catch((e) => {
        console.warn(`[numbers] Failed to release Twilio number ${vn.providerSid}:`, e.message);
      });
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.routingRule.updateMany({
        where: { virtualNumberId: id, deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.virtualNumber.update({ where: { id }, data: { deletedAt: now } }),
    ]);

    cache.del(`num:${vn.e164Number}`);
    await writeAudit(userId, 'DELETE', 'VirtualNumber', id, { e164Number: vn.e164Number });
    return { deleted: true };
  }

  // G-18: Restore soft-deleted number (within 30-day window)
  static async restoreNumber(id: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({ where: { id, userId } });
    if (!vn) throw ApiError.notFound('Virtual number not found');
    if (!vn.deletedAt) throw ApiError.badRequest('Number is not deleted');

    const RESTORE_WINDOW_DAYS = 30;
    const cutoff = new Date(Date.now() - RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    if (vn.deletedAt < cutoff) throw ApiError.badRequest('Restore window expired (30 days)');

    // Check plan limits before restoring
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const planLimit = PLAN_LIMITS[user?.plan ?? 'STARTER'] ?? PLAN_LIMITS.STARTER;
    const activeCount = await prisma.virtualNumber.count({ where: { userId, deletedAt: null } });
    if (activeCount >= planLimit) {
      throw ApiError.forbidden(`Restore would exceed your plan limit of ${planLimit} numbers.`);
    }

    const restored = await prisma.virtualNumber.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Restore associated routing rules (only ones deleted at the same time)
    await prisma.routingRule.updateMany({
      where: { virtualNumberId: id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    await writeAudit(userId, 'RESTORE', 'VirtualNumber', id, { e164: vn.e164Number });
    return restored;
  }
}
