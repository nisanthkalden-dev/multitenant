// Frontend-only Mock Super Admin Dashboard Overview Data
export const superAdminStats = {
  totalCompanies: {
    value: '248',
    growth: '+12 this month',
    trend: 'positive'
  },
  activeCompanies: {
    value: '214',
    growth: '86.3% of total',
    trend: 'positive'
  },
  totalUsers: {
    value: '4,862',
    growth: '+184 this month',
    trend: 'positive'
  },
  activeSubscriptions: {
    value: '228',
    growth: '+14 this month',
    trend: 'positive'
  },
  monthlyRevenue: {
    value: '₹8,42,500',
    growth: '+14.8% this month',
    trend: 'positive'
  }
};

export const revenueMonthlyData = [
  { month: 'May', revenue: 540000, label: '₹5.40L' },
  { month: 'Jun', revenue: 610000, label: '₹6.10L' },
  { month: 'Jul', revenue: 675000, label: '₹6.75L' },
  { month: 'Aug', revenue: 730000, label: '₹7.30L' },
  { month: 'Sep', revenue: 790000, label: '₹7.90L' },
  { month: 'Oct', revenue: 842500, label: '₹8.42L' }
];

export const subscriptionDistribution = [
  { plan: 'Starter', count: 82, percentage: 36, color: '#64748b' },
  { plan: 'Growth', count: 103, percentage: 45, color: 'var(--tertiary)' },
  { plan: 'Scale', count: 44, percentage: 19, color: '#8b5cf6' }
];

export const platformRecentActivities = [
  {
    id: 1,
    title: 'New Company Onboarded',
    detail: 'Pulse Media Labs activated their Growth plan subscription',
    time: '42 minutes ago',
    type: 'company',
    iconColor: '#06b6d4'
  },
  {
    id: 2,
    title: 'License Limit Alert',
    detail: 'Skyline Creative Studio reached 5/5 user seats',
    time: '2 hours ago',
    type: 'warning',
    iconColor: '#f59e0b'
  },
  {
    id: 3,
    title: 'Enterprise Plan Provisioned',
    detail: 'Zenith Health Systems upgraded database replica to Dedicated Tier',
    time: '5 hours ago',
    type: 'system',
    iconColor: '#10b981'
  },
  {
    id: 4,
    title: 'Security Compliance Checked',
    detail: 'Automated SOC2 audit snapshot generated for all 248 tenants',
    time: 'Yesterday at 9:00 PM',
    type: 'security',
    iconColor: '#8b5cf6'
  }
];
