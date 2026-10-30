// Platform Super Admin Dashboard Defaults (Populated dynamically from MySQL Backend)
export const superAdminStats = {
  totalCompanies: {
    value: '0',
    growth: '0%',
    trend: 'neutral'
  },
  activeCompanies: {
    value: '0',
    growth: '0%',
    trend: 'neutral'
  },
  totalUsers: {
    value: '0',
    growth: '0%',
    trend: 'neutral'
  },
  activeSubscriptions: {
    value: '0',
    growth: '0%',
    trend: 'neutral'
  },
  monthlyRevenue: {
    value: '₹0',
    growth: '0.0%',
    trend: 'neutral'
  }
};

export const revenueMonthlyData = [];

export const subscriptionDistribution = [
  { plan: 'Starter', count: 0, percentage: 0, color: '#64748b' },
  { plan: 'Growth', count: 0, percentage: 0, color: 'var(--tertiary)' },
  { plan: 'Scale', count: 0, percentage: 0, color: '#8b5cf6' }
];

export const platformRecentActivities = [];
