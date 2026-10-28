// Tenant-isolated mock data for multi-tenant CRM
// Every record is assigned a companyId and (where applicable) an assignedTo userId

export const MOCK_CUSTOMERS = [
  // COMP001 (Acme Corporation)
  {
    id: 'CUST-101',
    companyId: 'COMP001',
    name: 'Apex Global Logistics',
    contactPerson: 'Rohan Sharma',
    email: 'rohan.s@apexglobal.in',
    phone: '+91 98200 11223',
    industry: 'Logistics & Supply Chain',
    status: 'Active',
    tier: 'Enterprise',
    value: '₹12,40,000',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    lastContact: '2 hours ago'
  },
  {
    id: 'CUST-102',
    companyId: 'COMP001',
    name: 'Aura Fintech Solutions',
    contactPerson: 'Pooja Nair',
    email: 'pooja@aurafintech.io',
    phone: '+91 98111 22334',
    industry: 'Financial Technology',
    status: 'Active',
    tier: 'Mid-Market',
    value: '₹8,50,000',
    assignedTo: 'EMP002', // Priya
    managerId: 'manager',
    lastContact: '1 day ago'
  },
  {
    id: 'CUST-103',
    companyId: 'COMP001',
    name: 'Skyline Creative Studio',
    contactPerson: 'Ananya Roy',
    email: 'ananya@skylinestudio.com',
    phone: '+91 97665 44332',
    industry: 'Media & Design',
    status: 'Active',
    tier: 'Standard',
    value: '₹3,20,000',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    lastContact: '3 days ago'
  },
  {
    id: 'CUST-104',
    companyId: 'COMP001',
    name: 'BluePeak Capital',
    contactPerson: 'Karan Mehra',
    email: 'karan@bluepeakcapital.com',
    phone: '+91 99880 77665',
    industry: 'Investment Banking',
    status: 'Prospect',
    tier: 'Enterprise',
    value: '₹15,00,000',
    assignedTo: 'EMP003', // David
    managerId: 'manager',
    lastContact: 'Yesterday'
  },
  {
    id: 'CUST-105',
    companyId: 'COMP001',
    name: 'Nexus Cloud Systems',
    contactPerson: 'Aditya Sen',
    email: 'aditya@nexuscloud.io',
    phone: '+91 98450 99887',
    industry: 'SaaS / Cloud',
    status: 'Active',
    tier: 'Mid-Market',
    value: '₹6,40,000',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    lastContact: '4 hours ago'
  },

  // COMP002 (Zenith Health Systems)
  {
    id: 'CUST-201',
    companyId: 'COMP002',
    name: 'Metropolitan Hospital Network',
    contactPerson: 'Dr. Neha Kulkarni',
    email: 'dr.neha@metrohospitals.org',
    phone: '+91 98220 33445',
    industry: 'Healthcare / Hospitals',
    status: 'Active',
    tier: 'Enterprise',
    value: '₹32,00,000',
    assignedTo: 'zenith_employee',
    managerId: 'zenith_manager',
    lastContact: '1 hour ago'
  },
  {
    id: 'CUST-202',
    companyId: 'COMP002',
    name: 'Apollo Lifeline Diagnostics',
    contactPerson: 'Rajiv Malhotra',
    email: 'rajiv.m@apollolifeline.in',
    phone: '+91 97110 55667',
    industry: 'Diagnostics',
    status: 'Active',
    tier: 'Enterprise',
    value: '₹18,50,000',
    assignedTo: 'zenith_employee',
    managerId: 'zenith_manager',
    lastContact: 'Yesterday'
  }
];

export const MOCK_LEADS = [
  // COMP001 (Acme Corporation)
  {
    id: 'LEAD-101',
    companyId: 'COMP001',
    title: 'Enterprise Multi-site CRM Expansion',
    company: 'Vanguard Retail India',
    contactName: 'Sanjay Dutt',
    email: 'sanjay@vanguardretail.in',
    phone: '+91 98330 44556',
    estimatedValue: '₹4,50,000',
    stage: 'Qualified',
    priority: 'High',
    source: 'Website Demo Request',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    createdAt: '2 days ago'
  },
  {
    id: 'LEAD-102',
    companyId: 'COMP001',
    title: 'Cloud PBX & CRM Integration Pipeline',
    company: 'Hyperion Analytics',
    contactName: 'Ritika Deshmukh',
    email: 'ritika@hyperion.io',
    phone: '+91 98770 12345',
    estimatedValue: '₹3,20,000',
    stage: 'Proposal Sent',
    priority: 'High',
    source: 'Inbound Referral',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    createdAt: '3 days ago'
  },
  {
    id: 'LEAD-103',
    companyId: 'COMP001',
    title: '25-Seat Sales Team Migration',
    company: 'Vertex Energy',
    contactName: 'Farhan Zaidi',
    email: 'farhan@vertexenergy.com',
    phone: '+91 98112 99881',
    estimatedValue: '₹2,80,000',
    stage: 'Prospecting',
    priority: 'Medium',
    source: 'Cold Outreach',
    assignedTo: 'EMP002',
    managerId: 'manager',
    createdAt: '1 week ago'
  },
  {
    id: 'LEAD-104',
    companyId: 'COMP001',
    title: 'Annual Enterprise Licensing Tier',
    company: 'Silverline Pharma',
    contactName: 'Meera Iyer',
    email: 'meera.i@silverlinepharma.com',
    phone: '+91 97660 55443',
    estimatedValue: '₹7,50,000',
    stage: 'Negotiation',
    priority: 'Urgent',
    source: 'Partner Channel',
    assignedTo: 'employee', // John Doe
    managerId: 'manager',
    createdAt: 'Yesterday'
  },

  // COMP002 (Zenith Health Systems)
  {
    id: 'LEAD-201',
    companyId: 'COMP002',
    title: 'Specialty Clinic EHR Connectivity',
    company: 'CareFirst Clinics Group',
    contactName: 'Dr. Vivek Anand',
    email: 'vivek@carefirst.in',
    phone: '+91 98330 99887',
    estimatedValue: '₹14,00,000',
    stage: 'Qualified',
    priority: 'High',
    source: 'Healthcare Expo',
    assignedTo: 'zenith_employee',
    managerId: 'zenith_manager',
    createdAt: '3 days ago'
  }
];

export const MOCK_TASKS = [
  // COMP001 (Acme Corporation)
  {
    id: 'TASK-101',
    companyId: 'COMP001',
    title: 'Prepare final commercial proposal for Vanguard Retail',
    dueDate: 'Today, 4:00 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Proposal',
    assignedTo: 'employee', // John Doe
    assignedByName: 'Marcus Vance (Manager)',
    relatedTo: 'Vanguard Retail India'
  },
  {
    id: 'TASK-102',
    companyId: 'COMP001',
    title: 'Follow-up call with Rohan Sharma regarding Q4 renewal',
    dueDate: 'Today, 2:30 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Call',
    assignedTo: 'employee', // John Doe
    assignedByName: 'Self Scheduled',
    relatedTo: 'Apex Global Logistics'
  },
  {
    id: 'TASK-103',
    companyId: 'COMP001',
    title: 'Send API webhook documentation to Hyperion team',
    dueDate: 'Tomorrow, 11:00 AM',
    priority: 'Medium',
    status: 'Pending',
    category: 'Email',
    assignedTo: 'employee', // John Doe
    assignedByName: 'Marcus Vance (Manager)',
    relatedTo: 'Hyperion Analytics'
  },
  {
    id: 'TASK-104',
    companyId: 'COMP001',
    title: 'Schedule quarterly business review (QBR) with Skyline Studio',
    dueDate: 'Completed yesterday',
    priority: 'Low',
    status: 'Completed',
    category: 'Meeting',
    assignedTo: 'employee', // John Doe
    assignedByName: 'Self Scheduled',
    relatedTo: 'Skyline Creative Studio'
  },
  {
    id: 'TASK-105',
    companyId: 'COMP001',
    title: 'Review team weekly sales pipeline & close probability',
    dueDate: 'Today, 5:30 PM',
    priority: 'Urgent',
    status: 'Pending',
    category: 'Review',
    assignedTo: 'manager', // Marcus Vance
    assignedByName: 'Sarah Williams (Admin)',
    relatedTo: 'Acme Sales Dept'
  },
  {
    id: 'TASK-106',
    companyId: 'COMP001',
    title: 'Audit user seat allocations for upcoming annual billing',
    dueDate: 'Nov 02, 2026',
    priority: 'Medium',
    status: 'Pending',
    category: 'Governance',
    assignedTo: 'admin', // Sarah Williams
    assignedByName: 'System Notice',
    relatedTo: 'Acme Subscription'
  },
  {
    id: 'TASK-107',
    companyId: 'COMP001',
    title: 'Conduct onboarding check-in for Vertex Energy lead',
    dueDate: 'Oct 29, 2026',
    priority: 'Medium',
    status: 'Pending',
    category: 'Call',
    assignedTo: 'EMP002', // Priya
    assignedByName: 'Marcus Vance (Manager)',
    relatedTo: 'Vertex Energy'
  },

  // COMP002 (Zenith Health Systems)
  {
    id: 'TASK-201',
    companyId: 'COMP002',
    title: 'Finalize HIPAA compliance signoff with Metropolitan Network',
    dueDate: 'Today, 3:00 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Compliance',
    assignedTo: 'zenith_employee',
    assignedByName: 'Elena Rostova (Manager)',
    relatedTo: 'Metropolitan Hospital Network'
  }
];

export const MOCK_ACTIVITIES = [
  // COMP001 (Acme Corporation)
  {
    id: 'ACT-101',
    companyId: 'COMP001',
    userId: 'employee',
    userName: 'John Doe',
    userRole: 'Employee',
    action: 'Logged sales demo call with Rohan Sharma',
    target: 'Apex Global Logistics',
    time: '45 minutes ago',
    type: 'call'
  },
  {
    id: 'ACT-102',
    companyId: 'COMP001',
    userId: 'employee',
    userName: 'John Doe',
    userRole: 'Employee',
    action: 'Updated deal stage to Qualified (₹4.5L)',
    target: 'Vanguard Retail India',
    time: '2 hours ago',
    type: 'deal'
  },
  {
    id: 'ACT-103',
    companyId: 'COMP001',
    userId: 'EMP002',
    userName: 'Priya Sharma',
    userRole: 'Employee',
    action: 'Sent revised SLA quotation',
    target: 'Aura Fintech Solutions',
    time: '3 hours ago',
    type: 'document'
  },
  {
    id: 'ACT-104',
    companyId: 'COMP001',
    userId: 'manager',
    userName: 'Marcus Vance',
    userRole: 'Manager',
    action: 'Reassigned 3 incoming leads to Direct Sales Team',
    target: 'Regional Sales Pipeline',
    time: '4 hours ago',
    type: 'team'
  },
  {
    id: 'ACT-105',
    companyId: 'COMP001',
    userId: 'admin',
    userName: 'Sarah Williams',
    userRole: 'Company Admin',
    action: 'Provisioned new seat for Inside Sales specialist',
    target: 'User & Permissions',
    time: 'Yesterday',
    type: 'system'
  },

  // COMP002 (Zenith Health Systems)
  {
    id: 'ACT-201',
    companyId: 'COMP002',
    userId: 'zenith_employee',
    userName: 'Karan Mehra',
    userRole: 'Employee',
    action: 'Uploaded clinical lab integration specifications',
    target: 'Metropolitan Hospital Network',
    time: '1 hour ago',
    type: 'document'
  }
];
