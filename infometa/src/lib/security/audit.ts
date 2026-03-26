import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

export const SecurityEvents = {
  BRAND_REGISTERED:     'brand.registered',
  LOGIN_SUCCESS:        'auth.login.success',
  LOGIN_FAILED:         'auth.login.failed',
  LOGOUT:               'auth.logout',
  ACCOUNT_LOCKED:       'auth.account.locked',
  PASSWORD_CHANGED:     'auth.password.changed',
  MFA_ENABLED:          'auth.mfa.enabled',
  MFA_DISABLED:         'auth.mfa.disabled',
  SESSION_REVOKED:      'auth.session.revoked',
  TEAM_MEMBER_INVITED:  'team.member.invited',
  TEAM_MEMBER_REMOVED:  'team.member.removed',
  TEAM_ROLE_CHANGED:    'team.role.changed',
  BATCH_ACTIVATED:      'batch.activated',
  CODE_DEACTIVATED:     'code.deactivated',
  TOKEN_GENERATED:      'token.generated',
  TAMPER_DETECTED:      'security.tamper_detected',
} as const;

export async function writeAuditLog({
  userId, brandId, action, entity, entityId,
  ipAddress, userAgent, before, after,
}: {
  userId?:    string;
  brandId?:   string;
  action:     string;
  entity:     string;
  entityId?:  string;
  ipAddress?: string;
  userAgent?: string;
  before?:    Record<string, unknown>;
  after?:     Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId,
      brandId,
      action,
      entity,
      entityId,
      ipAddress,
      userAgent,
      before: before ?? null,
      after:  after ?? null,
    });
  } catch {
    // Non-blocking — don't crash on audit failure
  }
}
