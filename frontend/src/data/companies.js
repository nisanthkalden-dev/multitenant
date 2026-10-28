// Frontend-only Mock Companies Data for Super Admin
export const initialCompanies = [
  {
    id: 'cmp-101',
    name: 'Acme Technologies',
    logo: 'AT',
    logoColor: '#3b82f6',
    domain: 'acme.nexora.app',
    email: 'contact@acmetech.io',
    phone: '+91 98765 43210',
    address: 'Cyber City, Tower B, Gurugram, India',
    owner: {
      name: 'John Mathew',
      email: 'john.mathew@acmetech.io',
      avatar: 'JM'
    },
    plan: 'Growth',
    billingCycle: 'Monthly',
    price: '₹2,499 / mo',
    usersCount: 18,
    userLimit: 20,
    status: 'Active',
    joinedDate: 'Oct 14, 2026',
    renewalDate: 'Nov 14, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 22,
      storageUsed: '34.2 GB / 100 GB',
      leads: 1840,
      customers: 342,
      deals: 89
    },
    recentActivity: [
      { id: 1, action: 'Added 3 new team lead licenses', timestamp: '2 hours ago', user: 'John Mathew' },
      { id: 2, action: 'Exported monthly deals report', timestamp: 'Yesterday at 4:15 PM', user: 'Priya Verma' },
      { id: 3, action: 'Automated workflow rule updated', timestamp: 'Oct 21, 2026', user: 'System' }
    ]
  },
  {
    id: 'cmp-102',
    name: 'Zenith Health Systems',
    logo: 'ZH',
    logoColor: '#10b981',
    domain: 'zenith.nexora.app',
    email: 'operations@zenithhealth.org',
    phone: '+91 99887 76655',
    address: 'Indiranagar 100ft Rd, Bengaluru, India',
    owner: {
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@zenithhealth.org',
      avatar: 'AT'
    },
    plan: 'Scale',
    billingCycle: 'Annual',
    price: '₹57,588 / yr',
    usersCount: 148,
    userLimit: 'Unlimited',
    status: 'Active',
    joinedDate: 'Sep 28, 2026',
    renewalDate: 'Sep 28, 2027',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 141,
      storageUsed: '412.5 GB / 1000 GB',
      leads: 12450,
      customers: 2890,
      deals: 620
    },
    recentActivity: [
      { id: 1, action: 'Upgraded tenant database storage node', timestamp: '5 hours ago', user: 'DevOps' },
      { id: 2, action: 'HIPAA compliance audit export triggered', timestamp: 'Oct 22, 2026', user: 'Dr. Aris Thorne' }
    ]
  },
  {
    id: 'cmp-103',
    name: 'Aura Fintech Solutions',
    logo: 'AF',
    logoColor: '#8b5cf6',
    domain: 'aurafin.nexora.app',
    email: 'admin@aurafin.co',
    phone: '+91 91234 56789',
    address: 'BKC Bandra East, Mumbai, India',
    owner: {
      name: 'Rohan Deshmukh',
      email: 'rohan@aurafin.co',
      avatar: 'RD'
    },
    plan: 'Scale',
    billingCycle: 'Monthly',
    price: '₹5,999 / mo',
    usersCount: 68,
    userLimit: 'Unlimited',
    status: 'Active',
    joinedDate: 'Aug 19, 2026',
    renewalDate: 'Nov 19, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 64,
      storageUsed: '82.8 GB / 250 GB',
      leads: 6730,
      customers: 980,
      deals: 215
    },
    recentActivity: [
      { id: 1, action: 'Role permissions updated for Sales Leads', timestamp: '1 day ago', user: 'Rohan Deshmukh' }
    ]
  },
  {
    id: 'cmp-104',
    name: 'Vortex Global Logistics',
    logo: 'VG',
    logoColor: '#f59e0b',
    domain: 'vortex.nexora.app',
    email: 'support@vortexglobal.com',
    phone: '+91 97654 32190',
    address: 'HITEC City, Hyderabad, India',
    owner: {
      name: 'Elena Rostova',
      email: 'elena.r@vortexglobal.com',
      avatar: 'ER'
    },
    plan: 'Growth',
    billingCycle: 'Monthly',
    price: '₹2,499 / mo',
    usersCount: 19,
    userLimit: 20,
    status: 'Active',
    joinedDate: 'Oct 18, 2026',
    renewalDate: 'Nov 01, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 18,
      storageUsed: '12.4 GB / 50 GB',
      leads: 940,
      customers: 84,
      deals: 29
    },
    recentActivity: [
      { id: 1, action: 'Invited 6 new sales executives', timestamp: '3 hours ago', user: 'Elena Rostova' }
    ]
  },
  {
    id: 'cmp-105',
    name: 'Skyline Creative Studio',
    logo: 'SC',
    logoColor: '#ec4899',
    domain: 'skyline.nexora.app',
    email: 'hello@skylinestudio.design',
    phone: '+91 94567 89012',
    address: 'Koramangala 4th Block, Bengaluru, India',
    owner: {
      name: 'Ananya Roy',
      email: 'ananya@skylinestudio.design',
      avatar: 'AR'
    },
    plan: 'Starter',
    billingCycle: 'Monthly',
    price: '₹999 / mo',
    usersCount: 5,
    userLimit: 5,
    status: 'Active',
    joinedDate: 'Jul 04, 2026',
    renewalDate: 'Nov 04, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 5,
      storageUsed: '8.6 GB / 20 GB',
      leads: 320,
      customers: 62,
      deals: 18
    },
    recentActivity: [
      { id: 1, action: 'Reached 100% user license threshold', timestamp: 'Oct 19, 2026', user: 'System' }
    ]
  },
  {
    id: 'cmp-106',
    name: 'Pulse Media Labs',
    logo: 'PM',
    logoColor: '#06b6d4',
    domain: 'pulsemedia.nexora.app',
    email: 'admin@pulsemedialabs.com',
    phone: '+91 93456 78901',
    address: 'Connaught Place, New Delhi, India',
    owner: {
      name: 'David Lee',
      email: 'david.lee@pulsemedialabs.com',
      avatar: 'DL'
    },
    plan: 'Growth',
    billingCycle: 'Monthly',
    price: '₹2,499 / mo',
    usersCount: 17,
    userLimit: 20,
    status: 'Active',
    joinedDate: 'Oct 21, 2026',
    renewalDate: 'Nov 04, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 14,
      storageUsed: '14.1 GB / 50 GB',
      leads: 620,
      customers: 110,
      deals: 35
    },
    recentActivity: [
      { id: 1, action: 'Connected Google Workspace contact sync', timestamp: 'Oct 23, 2026', user: 'David Lee' }
    ]
  },
  {
    id: 'cmp-107',
    name: 'BluePeak Capital',
    logo: 'BP',
    logoColor: '#ef4444',
    domain: 'bluepeak.nexora.app',
    email: 'compliance@bluepeakcap.in',
    phone: '+91 92345 67890',
    address: 'Nariman Point, Mumbai, India',
    owner: {
      name: 'Karan Mehra',
      email: 'karan@bluepeakcap.in',
      avatar: 'KM'
    },
    plan: 'Scale',
    billingCycle: 'Annual',
    price: '₹57,588 / yr',
    usersCount: 88,
    userLimit: 'Unlimited',
    status: 'Suspended',
    joinedDate: 'May 12, 2026',
    renewalDate: 'Oct 12, 2026',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 0,
      storageUsed: '74.5 GB / 250 GB',
      leads: 4100,
      customers: 520,
      deals: 140
    },
    recentActivity: [
      { id: 1, action: 'Workspace access locked by Super Admin (Payment Overdue)', timestamp: 'Oct 15, 2026', user: 'Super Admin' }
    ]
  },
  {
    id: 'cmp-108',
    name: 'Hyperion Analytics',
    logo: 'HA',
    logoColor: '#6366f1',
    domain: 'hyperion.nexora.app',
    email: 'info@hyperion-analytics.io',
    phone: '+91 98112 34567',
    address: 'Salt Lake Sector V, Kolkata, India',
    owner: {
      name: 'Siddharth Sen',
      email: 'siddharth@hyperion-analytics.io',
      avatar: 'SS'
    },
    plan: 'Scale',
    billingCycle: 'Annual',
    price: '₹57,588 / yr',
    usersCount: 210,
    userLimit: 'Unlimited',
    status: 'Active',
    joinedDate: 'Jan 15, 2026',
    renewalDate: 'Jan 15, 2027',
    trialDaysRemaining: null,
    metrics: {
      activeUsers: 198,
      storageUsed: '512 GB / 1000 GB',
      leads: 24500,
      customers: 4120,
      deals: 980
    },
    recentActivity: [
      { id: 1, action: 'Super Admin provisioned dedicated tenant replica', timestamp: 'Oct 20, 2026', user: 'Super Admin' }
    ]
  }
];
