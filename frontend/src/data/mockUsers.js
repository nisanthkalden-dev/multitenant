// Mock users directory for Multi-tenant CRM frontend
// Supports Super Admin & Company Roles: 'company_admin', 'manager', 'employee'

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  manager: 'Manager',
  employee: 'Employee'
};

export const MOCK_COMPANIES = [
  {
    id: 'COMP001',
    name: 'Acme Corporation',
    workspace: 'acme.nexora.app',
    domain: 'acmecorp.com',
    plan: 'Growth',
    billingCycle: 'Monthly',
    price: '₹2,499',
    status: 'Active',
    renewalDate: 'Nov 24, 2026',
    maxUsers: 20,
    logo: 'AC'
  },
  {
    id: 'COMP002',
    name: 'Zenith Health Systems',
    workspace: 'zenith.nexora.app',
    domain: 'zenithhealth.org',
    plan: 'Scale',
    billingCycle: 'Annual',
    price: '₹4,799',
    status: 'Active',
    renewalDate: 'Sep 28, 2027',
    maxUsers: 'Unlimited',
    logo: 'ZH'
  }
];

export const MOCK_USERS = [
  // Super Admin
  {
    userId: 'superadmin',
    name: 'Global Platform Admin',
    fullName: 'Global Platform Admin',
    email: 'superadmin@nexora.app',
    role: 'super_admin',
    companyId: null,
    companyName: 'Nexora Platform',
    avatar: 'SA',
    department: 'Platform Engineering',
    status: 'Active'
  },

  // Company 1 (Acme Corporation) Users
  {
    userId: 'admin',
    name: 'Sarah Williams',
    fullName: 'Sarah Williams',
    email: 'admin@acmecorp.com',
    role: 'company_admin',
    companyId: 'COMP001',
    companyName: 'Acme Corporation',
    avatar: 'SW',
    department: 'Executive Leadership',
    status: 'Active'
  },
  {
    userId: 'manager',
    name: 'Marcus Vance',
    fullName: 'Marcus Vance',
    email: 'manager@acmecorp.com',
    role: 'manager',
    companyId: 'COMP001',
    companyName: 'Acme Corporation',
    avatar: 'MV',
    department: 'Regional Sales',
    status: 'Active'
  },
  {
    userId: 'employee',
    name: 'John Doe',
    fullName: 'John Doe',
    email: 'john.doe@acmecorp.com',
    role: 'employee',
    companyId: 'COMP001',
    companyName: 'Acme Corporation',
    avatar: 'JD',
    department: 'Direct Sales & BD',
    status: 'Active'
  },
  {
    userId: 'EMP002',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    email: 'priya.s@acmecorp.com',
    role: 'employee',
    companyId: 'COMP001',
    companyName: 'Acme Corporation',
    avatar: 'PS',
    department: 'Customer Success',
    status: 'Active'
  },
  {
    userId: 'EMP003',
    name: 'David Chen',
    fullName: 'David Chen',
    email: 'david.c@acmecorp.com',
    role: 'employee',
    companyId: 'COMP001',
    companyName: 'Acme Corporation',
    avatar: 'DC',
    department: 'Inside Sales',
    status: 'Active'
  },

  // Company 2 (Zenith Health Systems) Users
  {
    userId: 'zenith_admin',
    name: 'Dr. Aris Thorne',
    fullName: 'Dr. Aris Thorne',
    email: 'aris.thorne@zenithhealth.org',
    role: 'company_admin',
    companyId: 'COMP002',
    companyName: 'Zenith Health Systems',
    avatar: 'AT',
    department: 'Operations',
    status: 'Active'
  },
  {
    userId: 'zenith_manager',
    name: 'Elena Rostova',
    fullName: 'Elena Rostova',
    email: 'elena.r@zenithhealth.org',
    role: 'manager',
    companyId: 'COMP002',
    companyName: 'Zenith Health Systems',
    avatar: 'ER',
    department: 'Hospital Relations',
    status: 'Active'
  },
  {
    userId: 'zenith_employee',
    name: 'Karan Mehra',
    fullName: 'Karan Mehra',
    email: 'karan.m@zenithhealth.org',
    role: 'employee',
    companyId: 'COMP002',
    companyName: 'Zenith Health Systems',
    avatar: 'KM',
    department: 'Clinical Client Care',
    status: 'Active'
  }
];
