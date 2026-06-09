import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { ApiError } from '../lib/apiError.js';

export class NumberService {
  static async listNumbers(userId: string) {
    return prisma.virtualNumber.findMany({
      where: { userId },
      include: { _count: { select: { callLogs: true, routingRules: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getNumberDetails(id: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id, userId },
      include: { routingRules: { orderBy: { priority: 'asc' } } },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }
    return vn;
  }

  static async provisionNumber(userId: string, reqBody: any) {
    const { friendlyName, countryCode = 'US', numberType = 'LOCAL', timezone = 'America/New_York' } = reqBody;

    // Generate a fake E.164 number for local dev
    const area = Math.floor(200 + Math.random() * 800);
    const line = Math.floor(1000000 + Math.random() * 9000000);
    const e164 = `+1${area}${line}`;

    return prisma.virtualNumber.create({
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
  }

  static async updateNumberSettings(id: string, userId: string, reqBody: any) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

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

    // Invalidate cache
    cache.del(`num:${vn.e164Number}`);
    return updated;
  }

  static async deleteNumber(id: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

    await prisma.virtualNumber.delete({ where: { id } });
    cache.del(`num:${vn.e164Number}`);
    return { deleted: true };
  }
}
