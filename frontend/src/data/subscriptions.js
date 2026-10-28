// Frontend-only Mock Subscription Plans & Subscriptions Data
export const subscriptionPlans = [
  {
    id: 'plan-starter',
    name: 'Starter',
    typeTag: 'ENTRY',
    subtitle: 'For small teams getting started with structured customer management.',
    monthlyPrice: 999,
    annualPrice: 9588,
    priceDisplay: '₹999',
    userLimitText: '5 Team Members',
    popular: false,
    badgeColor: '#64748b',
    features: [
      '5 Team Members',
      '1 Workspace',
      'Lead Management',
      'Contact Management',
      'Sales Pipeline',
      'Tasks & Reminders',
      'Basic Reports'
    ],
    stats: {
      activeCompanies: 82,
      mrrContribution: '₹81,918'
    }
  },
  {
    id: 'plan-growth',
    name: 'Growth',
    typeTag: 'RECOMMENDED',
    badge: 'MOST POPULAR',
    subtitle: 'For growing businesses expanding sales operations and active pipelines.',
    monthlyPrice: 2499,
    annualPrice: 23988,
    priceDisplay: '₹2,499',
    userLimitText: '20 Team Members',
    popular: true,
    badgeColor: 'var(--tertiary)',
    features: [
      '20 Team Members',
      'Multiple Workspaces',
      'Advanced Pipeline',
      'Automation Workflows',
      'Reports & Analytics',
      'Team Permissions',
      'Activity Tracking'
    ],
    stats: {
      activeCompanies: 103,
      mrrContribution: '₹2,57,397'
    }
  },
  {
    id: 'plan-scale',
    name: 'Scale',
    typeTag: 'ENTERPRISE',
    subtitle: 'For larger organizations needing complete multi-workspace governance.',
    monthlyPrice: 5999,
    annualPrice: 57588,
    priceDisplay: '₹5,999',
    userLimitText: 'Unlimited Team Members',
    popular: false,
    badgeColor: '#8b5cf6',
    features: [
      'Unlimited Team Members',
      'Multiple Workspaces',
      'Advanced Permissions',
      'Advanced Reports',
      'Custom Automation',
      'Priority Support',
      'Custom Configuration'
    ],
    stats: {
      activeCompanies: 44,
      mrrContribution: '₹2,63,956'
    }
  }
];

export const initialSubscriptions = [
  {
    id: 'sub-1001',
    companyId: 'cmp-101',
    companyName: 'Acme Technologies',
    plan: 'Growth',
    billingCycle: 'Monthly',
    amount: '₹2,499',
    status: 'Active',
    startDate: 'Oct 14, 2026',
    renewalDate: 'Nov 14, 2026',
    autoRenew: true
  },
  {
    id: 'sub-1002',
    companyId: 'cmp-102',
    companyName: 'Zenith Health Systems',
    plan: 'Scale',
    billingCycle: 'Annual',
    amount: '₹57,588',
    status: 'Active',
    startDate: 'Sep 28, 2026',
    renewalDate: 'Sep 28, 2027',
    autoRenew: true
  },
  {
    id: 'sub-1003',
    companyId: 'cmp-103',
    companyName: 'Aura Fintech Solutions',
    plan: 'Scale',
    billingCycle: 'Monthly',
    amount: '₹5,999',
    status: 'Active',
    startDate: 'Aug 19, 2026',
    renewalDate: 'Nov 19, 2026',
    autoRenew: true
  },
  {
    id: 'sub-1004',
    companyId: 'cmp-104',
    companyName: 'Vortex Global Logistics',
    plan: 'Growth',
    billingCycle: 'Monthly',
    amount: '₹2,499',
    status: 'Active',
    startDate: 'Oct 18, 2026',
    renewalDate: 'Nov 01, 2026',
    autoRenew: true
  },
  {
    id: 'sub-1005',
    companyId: 'cmp-105',
    companyName: 'Skyline Creative Studio',
    plan: 'Starter',
    billingCycle: 'Monthly',
    amount: '₹999',
    status: 'Active',
    startDate: 'Jul 04, 2026',
    renewalDate: 'Nov 04, 2026',
    autoRenew: true
  },
  {
    id: 'sub-1006',
    companyId: 'cmp-106',
    companyName: 'Pulse Media Labs',
    plan: 'Growth',
    billingCycle: 'Monthly',
    amount: '₹2,499',
    status: 'Active',
    startDate: 'Oct 21, 2026',
    renewalDate: 'Nov 04, 2026',
    autoRenew: true
  },
  {
    id: 'sub-1007',
    companyId: 'cmp-107',
    companyName: 'BluePeak Capital',
    plan: 'Scale',
    billingCycle: 'Annual',
    amount: '₹57,588',
    status: 'Suspended',
    startDate: 'May 12, 2026',
    renewalDate: 'Oct 12, 2026',
    autoRenew: false
  },
  {
    id: 'sub-1008',
    companyId: 'cmp-108',
    companyName: 'Hyperion Analytics',
    plan: 'Scale',
    billingCycle: 'Annual',
    amount: '₹57,588',
    status: 'Active',
    startDate: 'Jan 15, 2026',
    renewalDate: 'Jan 15, 2027',
    autoRenew: true
  }
];
