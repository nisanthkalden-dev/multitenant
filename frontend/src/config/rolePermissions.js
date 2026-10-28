// Role-based Access Control (RBAC) Navigation Configuration & Route Permissions
// Defines what routes and features each role can view and access.

export const ROLE_PERMISSIONS = {
  company_admin: {
    canManageUsers: true,
    canManageCompanySettings: true,
    canManageSubscription: true,
    canViewCompanyReports: true,
    canViewAllCustomers: true,
    canViewAllLeads: true,
    canAssignTasks: true,
    canDeleteRecords: true,
    allowedRoutes: [
      '/company/dashboard',
      '/company/users',
      '/company/customers',
      '/company/leads',
      '/company/tasks',
      '/company/reports',
      '/company/subscription',
      '/company/settings'
    ]
  },
  manager: {
    canManageUsers: false,
    canViewTeamMembers: true,
    canManageCompanySettings: false,
    canManageSubscription: false,
    canViewCompanyReports: true,
    canViewAllCustomers: true,
    canViewAllLeads: true,
    canAssignTasks: true,
    canDeleteRecords: false,
    allowedRoutes: [
      '/company/dashboard',
      '/company/team',
      '/company/customers',
      '/company/leads',
      '/company/tasks',
      '/company/reports',
      '/company/settings' // Limited / profile & team preference settings
    ]
  },
  employee: {
    canManageUsers: false,
    canManageCompanySettings: false,
    canManageSubscription: false,
    canViewCompanyReports: false,
    canViewAllCustomers: false, // only assigned
    canViewAllLeads: false, // only assigned
    canAssignTasks: false,
    canDeleteRecords: false,
    allowedRoutes: [
      '/company/dashboard',
      '/company/customers',
      '/company/leads',
      '/company/tasks',
      '/company/activities',
      '/company/settings' // Personal Profile only
    ]
  },
  super_admin: {
    isSuperAdmin: true,
    allowedRoutes: [
      '/super-admin',
      '/super-admin/companies',
      '/super-admin/companies/add',
      '/super-admin/subscriptions',
      '/super-admin/settings'
    ]
  }
};

/**
 * Reusable dynamic navigation configuration per role
 */
export const NAVIGATION_CONFIG = {
  company_admin: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/company/dashboard',
      icon: 'dashboard'
    },
    {
      key: 'users',
      label: 'Employees / Users',
      path: '/company/users',
      icon: 'users',
      badge: 'Team'
    },
    {
      key: 'customers',
      label: 'Customers',
      path: '/company/customers',
      icon: 'customers'
    },
    {
      key: 'leads',
      label: 'Leads',
      path: '/company/leads',
      icon: 'leads'
    },
    {
      key: 'tasks',
      label: 'Tasks',
      path: '/company/tasks',
      icon: 'tasks'
    },
    {
      key: 'reports',
      label: 'Reports & Revenue',
      path: '/company/reports',
      icon: 'reports'
    },
    {
      key: 'subscription',
      label: 'Subscription',
      path: '/company/subscription',
      icon: 'subscription'
    },
    {
      key: 'settings',
      label: 'Company Settings',
      path: '/company/settings',
      icon: 'settings'
    }
  ],

  manager: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/company/dashboard',
      icon: 'dashboard'
    },
    {
      key: 'team',
      label: 'Team Members',
      path: '/company/team',
      icon: 'users',
      badge: 'Active'
    },
    {
      key: 'customers',
      label: 'Customers',
      path: '/company/customers',
      icon: 'customers'
    },
    {
      key: 'leads',
      label: 'Leads Pipeline',
      path: '/company/leads',
      icon: 'leads'
    },
    {
      key: 'tasks',
      label: 'Team Tasks',
      path: '/company/tasks',
      icon: 'tasks'
    },
    {
      key: 'reports',
      label: 'Team Reports',
      path: '/company/reports',
      icon: 'reports'
    },
    {
      key: 'settings',
      label: 'Settings',
      path: '/company/settings',
      icon: 'settings'
    }
  ],

  employee: [
    {
      key: 'dashboard',
      label: 'Personal Dashboard',
      path: '/company/dashboard',
      icon: 'dashboard'
    },
    {
      key: 'customers',
      label: 'My Customers',
      path: '/company/customers',
      icon: 'customers'
    },
    {
      key: 'leads',
      label: 'My Leads',
      path: '/company/leads',
      icon: 'leads'
    },
    {
      key: 'tasks',
      label: 'My Tasks',
      path: '/company/tasks',
      icon: 'tasks'
    },
    {
      key: 'activities',
      label: 'My Activities',
      path: '/company/activities',
      icon: 'activity'
    },
    {
      key: 'settings',
      label: 'My Profile',
      path: '/company/settings',
      icon: 'settings'
    }
  ]
};

/**
 * Check whether a user's role has permission to access a target route path
 */
export function hasRouteAccess(role, path) {
  if (!role) return false;
  if (role === 'super_admin') {
    return path.startsWith('/super-admin');
  }
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  // Exact match or base path match
  return permissions.allowedRoutes.some((allowed) => 
    path === allowed || path.startsWith(`${allowed}/`)
  );
}

/**
 * Determine default landing dashboard path based on role
 */
export function getDefaultDashboardPath(role) {
  if (role === 'super_admin') {
    return '/super-admin';
  }
  return '/company/dashboard';
}
