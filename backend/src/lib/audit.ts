import { prisma } from './prisma.js';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
type EntityType = 'VirtualNumber' | 'RoutingRule';

export async function writeAudit(
  userId: string,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  changes?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog
    .create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    })
    .catch((e) => console.error('[audit] Failed to write audit log:', e));
}
