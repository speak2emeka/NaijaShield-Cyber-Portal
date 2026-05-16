import { UserRole } from '@prisma/client';

export const permissionMatrix = {
  [UserRole.CLIENT]: ['client:read', 'ticket:create', 'ticket:comment'],
  [UserRole.STAFF]: ['ticket:read', 'request:read'],
  [UserRole.ANALYST]: ['ticket:read', 'ticket:update', 'report:create'],
  [UserRole.SUPERVISOR]: ['ticket:*', 'request:*', 'report:*'],
  [UserRole.AUDITOR]: ['audit:read', 'client:read', 'report:read'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.SUPERADMIN]: ['*']
} satisfies Record<UserRole, string[]>;

export function hasPermission(role: UserRole, permission: string) {
  const permissions = permissionMatrix[role] || [];
  return permissions.includes('*') || permissions.includes(permission) || permissions.some(item => item.endsWith(':*') && permission.startsWith(item.slice(0, -1)));
}
