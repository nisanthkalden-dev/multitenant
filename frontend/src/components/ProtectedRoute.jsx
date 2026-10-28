import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRouteAccess, getDefaultDashboardPath } from '../config/rolePermissions';

export default function ProtectedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { isAuthenticated, role, user, permissions } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin route boundary
  if (location.pathname.startsWith('/super-admin') && role !== 'super_admin') {
    return <AccessDenied reason="Super Admin platform privileges are required to access this portal." />;
  }

  // Company route boundary for super admin
  if (location.pathname.startsWith('/company') && role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  // Check required specific role if specified
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(role)) {
      return (
        <AccessDenied
          userRole={role}
          requiredRole={roles.join(' or ')}
          reason="Your current role does not have permission to view this section."
        />
      );
    }
  }

  // Check required specific permission flag if specified
  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <AccessDenied
        userRole={role}
        reason="Your account does not possess the operational permission for this action."
      />
    );
  }

  // Check general route-level RBAC table
  if (location.pathname.startsWith('/company') && !hasRouteAccess(role, location.pathname)) {
    return (
      <AccessDenied
        userRole={role}
        path={location.pathname}
        reason="This page is restricted according to your assigned organizational role."
      />
    );
  }

  return children;
}

export function AccessDenied({ userRole, requiredRole, reason, path }) {
  const { user } = useAuth();
  const returnPath = getDefaultDashboardPath(userRole || user?.role);

  return (
    <div className="crm-access-denied-page">
      <div className="access-denied-card">
        <div className="access-denied-icon-wrap" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <div className="access-denied-badge font-mono">
          <span>ACCESS RESTRICTED (RBAC 403)</span>
        </div>

        <h1 className="access-denied-title">Permission Denied</h1>
        <p className="access-denied-desc">
          {reason || "You do not have the authorization required to access this resource."}
        </p>

        {path && (
          <div className="access-denied-path-pill font-mono">
            <span>Attempted: <code>{path}</code></span>
          </div>
        )}

        <div className="access-denied-meta-box">
          <div className="meta-row">
            <span className="meta-label">Active User:</span>
            <span className="meta-val font-mono">{user?.name || user?.fullName || 'Anonymous'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Assigned Role:</span>
            <span className="meta-val font-mono role-tag">{userRole || user?.role || 'Unassigned'}</span>
          </div>
          {requiredRole && (
            <div className="meta-row">
              <span className="meta-label">Required Role:</span>
              <span className="meta-val font-mono">{requiredRole}</span>
            </div>
          )}
          <div className="meta-row">
            <span className="meta-label">Workspace:</span>
            <span className="meta-val font-mono">{user?.companyName || user?.workspace || 'Tenant Isolation'}</span>
          </div>
        </div>

        <div className="access-denied-actions">
          <Link to={returnPath} className="btn btn-primary font-mono">
            &larr; Return to Your Dashboard
          </Link>
          <Link to="/login" className="btn btn-secondary font-mono">
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
