// Platform Subscription Plans & Defaults
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
      activeCompanies: 0,
      mrrContribution: '₹0'
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
      activeCompanies: 0,
      mrrContribution: '₹0'
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
      activeCompanies: 0,
      mrrContribution: '₹0'
    }
  }
];

// Clean real array: starts empty and loads live records from MySQL
export const initialSubscriptions = [];
