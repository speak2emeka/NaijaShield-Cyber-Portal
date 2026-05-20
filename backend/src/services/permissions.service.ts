import { UserRole } from '@prisma/client';

export const permissionMatrix = {
  [UserRole.CLIENT]: ['client:read', 'ticket:create', 'ticket:comment', 'billing:read', 'security-event:read'],
  [UserRole.STAFF]: ['client:read', 'ticket:read', 'ticket:update', 'request:read', 'crm:read', 'crm:write', 'meeting:*', 'message:*'],
  [UserRole.ANALYST]: ['client:read', 'ticket:read', 'ticket:update', 'request:read', 'request:update', 'report:create', 'report:read', 'scan:*', 'osint:read', 'security-event:read', 'attack-surface:*', 'ai:read', 'ai:write', 'evidence:*', 'soc:*', 'pentest:*', 'attack-lab:*'],
  [UserRole.SUPERVISOR]: ['client:*', 'ticket:*', 'request:*', 'report:*', 'scan:*', 'osint:*', 'security-event:*', 'crm:*', 'staff:read', 'schedule:*', 'soc:*', 'pentest:*', 'ai:*', 'evidence:*', 'attack-lab:*', 'billing:read', 'compliance:read'],
  [UserRole.AUDITOR]: ['audit:read', 'client:read', 'report:read', 'security-event:read', 'crm:read', 'compliance:read', 'evidence:read', 'scan:read'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.SUPERADMIN]: ['*']
} satisfies Record<UserRole, string[]>;

export function hasPermission(role: UserRole, permission: string) {
  const permissions = permissionMatrix[role] || [];
  return permissions.includes('*') || permissions.includes(permission) || permissions.some(item => item.endsWith(':*') && permission.startsWith(item.slice(0, -1)));
}
