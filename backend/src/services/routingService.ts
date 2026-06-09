import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { ApiError } from '../lib/apiError.js';

export class RoutingService {
  static parseRule(rule: any) {
    if (!rule) return null;
    return {
      ...rule,
      activeDays: rule.activeDays ? rule.activeDays.split(',').map(Number) : [],
      destinations: (() => { 
        try { 
          return typeof rule.destinations === 'string' ? JSON.parse(rule.destinations) : (rule.destinations || []); 
        } catch { 
          return []; 
        } 
      })(),
    };
  }

  static async listRules(numberId: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id: numberId, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

    const rules = await prisma.routingRule.findMany({
      where: { virtualNumberId: numberId },
      orderBy: { priority: 'asc' },
    });
    return rules.map(RoutingService.parseRule);
  }

  static async createRule(numberId: string, userId: string, reqBody: any) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id: numberId, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

    const { label, priority, activeDays, openTime, closeTime, action, destinations, ringStrategy, ringTimeout, sipUri } = reqBody;

    const rule = await prisma.routingRule.create({
      data: {
        virtualNumberId: numberId,
        label: label || 'New Rule',
        priority: priority ?? 0,
        activeDays: Array.isArray(activeDays) ? activeDays.join(',') : (activeDays || '1,2,3,4,5'),
        openTime: openTime || null,
        closeTime: closeTime || null,
        action: action || 'FORWARD_PSTN',
        destinations: JSON.stringify(destinations || []),
        ringStrategy: ringStrategy || 'SEQUENTIAL',
        ringTimeout: ringTimeout || 30,
        sipUri: sipUri || null,
      },
    });

    cache.del(`num:${vn.e164Number}`);
    return RoutingService.parseRule(rule);
  }

  static async updateRule(numberId: string, ruleId: string, userId: string, reqBody: any) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id: numberId, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

    const rule = await prisma.routingRule.findFirst({
      where: { id: ruleId, virtualNumberId: numberId },
    });
    if (!rule) {
      throw ApiError.notFound('Routing rule not found');
    }

    const updated = await prisma.routingRule.update({
      where: { id: ruleId },
      data: {
        label: reqBody.label ?? rule.label,
        priority: reqBody.priority ?? rule.priority,
        activeDays: Array.isArray(reqBody.activeDays)
          ? reqBody.activeDays.join(',')
          : reqBody.activeDays ?? rule.activeDays,
        openTime: reqBody.openTime !== undefined ? reqBody.openTime : rule.openTime,
        closeTime: reqBody.closeTime !== undefined ? reqBody.closeTime : rule.closeTime,
        action: reqBody.action ?? rule.action,
        destinations: reqBody.destinations ? JSON.stringify(reqBody.destinations) : rule.destinations,
        ringStrategy: reqBody.ringStrategy ?? rule.ringStrategy,
        ringTimeout: reqBody.ringTimeout ?? rule.ringTimeout,
        sipUri: reqBody.sipUri !== undefined ? reqBody.sipUri : rule.sipUri,
      },
    });

    cache.del(`num:${vn.e164Number}`);
    return RoutingService.parseRule(updated);
  }

  static async deleteRule(numberId: string, ruleId: string, userId: string) {
    const vn = await prisma.virtualNumber.findFirst({
      where: { id: numberId, userId },
    });
    if (!vn) {
      throw ApiError.notFound('Virtual number not found');
    }

    const rule = await prisma.routingRule.findFirst({
      where: { id: ruleId, virtualNumberId: numberId },
    });
    if (!rule) {
      throw ApiError.notFound('Routing rule not found');
    }

    await prisma.routingRule.delete({
      where: { id: ruleId },
    });

    cache.del(`num:${vn.e164Number}`);
    return { deleted: true };
  }
}
