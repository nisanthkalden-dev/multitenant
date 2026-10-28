import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleGuard component: conditionally renders children only if the logged-in user
 * matches the allowed roles or possesses the required permission.
 *
 * Usage:
 * <RoleGuard allowedRoles={['company_admin', 'manager']}>
 *   <button>Assign Task</button>
 * </RoleGuard>
 */
export default function RoleGuard({ children, allowedRoles, requiredPermission, fallback = null }) {
  const { role, permissions } = useAuth();

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(role)) {
      return fallback;
    }
  }

  if (requiredPermission && !permissions[requiredPermission]) {
    return fallback;
  }

  return <>{children}</>;
}
