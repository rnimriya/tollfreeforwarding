import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { ApiError } from '../lib/apiError.js';
import { validateNumberType } from '../lib/validate.js';
import { writeAudit } from '../lib/audit.js';

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

  static async provisionNumber(userId: string, reqBody: any) {
    const {
      friendlyName,
      countryCode = 'US',
      timezone = 'America/New_York',
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

    // Retry up to 5 times to handle the rare E.164 unique-constraint collision (P2002).
    const MAX_ATTEMPTS = 5;
    let vn: Awaited<ReturnType<typeof prisma.virtualNumber.create>> | null = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const area = Math.floor(200 + Math.random() * 800);
      const line = Math.floor(1000000 + Math.random() * 9000000);
      const e164 = `+1${area}${line}`;
      try {
        vn = await prisma.virtualNumber.create({
          data: {
            userId,
            e164Number: e164,
            friendlyName: friendlyName || `My Number ${area}`,
            countryCode,
            numberType,
            timezone,
            status: 'ACTIVE',
          },
        });
        break;
      } catch (err: any) {
        if (err?.code !== 'P2002' || attempt === MAX_ATTEMPTS) throw err;
      }
    }
    if (!vn) throw new ApiError(500, 'Failed to provision a unique number — please try again');
    await writeAudit(userId, 'CREATE', 'VirtualNumber', vn.id, { e164: vn.e164Number, friendlyName: vn.friendlyName });
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
}
