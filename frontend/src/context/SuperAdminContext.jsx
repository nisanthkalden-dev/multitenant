import React, { createContext, useContext, useState } from 'react';
import { initialCompanies } from '../data/companies';
import { initialSubscriptions, subscriptionPlans } from '../data/subscriptions';
import { superAdminStats, revenueMonthlyData, subscriptionDistribution, platformRecentActivities } from '../data/dashboard';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [plans, setPlans] = useState(subscriptionPlans);
  const [activities, setActivities] = useState(platformRecentActivities);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'NEXORA CRM',
    platformEmail: 'support@nexoracrm.com',
    supportPhone: '+91 98765 00000',
    defaultCurrency: 'INR - ₹',
    defaultTimezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    logoUrl: null
  });

  // Profile Settings state
  const [profileSettings, setProfileSettings] = useState({
    fullName: 'Super Admin',
    email: 'admin@nexoracrm.com',
    phone: '+91 98765 43210',
    userId: 'superadmin',
    avatarUrl: null
  });

  // Security Settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginActivity: [
      { id: 1, device: 'Chrome — Windows 11', location: 'Bengaluru, India', lastActive: 'Active now', current: true },
      { id: 2, device: 'Edge — Windows 11', location: 'Bengaluru, India', lastActive: '2 days ago', current: false },
      { id: 3, device: 'Mobile Chrome — Android 14', location: 'Mumbai, India', lastActive: '5 days ago', current: false }
    ]
  });

  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    emailCompanyRegistration: true,
    emailSubscriptionExpiration: true,
    emailPaymentNotification: true,
    emailSystemAlerts: true,
    adminUserRegistration: false,
    adminCompanySuspension: true,
    adminPlatformAnnouncements: true
  });

  // Platform Preferences state
  const [platformPreferences, setPlatformPreferences] = useState({
    theme: 'Dark',
    language: 'English',
    defaultDashboardView: 'Overview',
    collapsedSidebar: false
  });

  // Actions
  const addCompany = (newCompanyData) => {
    const id = `cmp-${Date.now()}`;
    const initials = newCompanyData.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    const planPrices = {
      Starter: '₹999 / mo',
      Growth: '₹2,499 / mo',
      Scale: '₹5,999 / mo'
    };

    const newCompany = {
      id,
      name: newCompanyData.name,
      logo: initials || 'CO',
      logoColor: 'var(--tertiary)',
      domain: `${newCompanyData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.nexora.app`,
      email: newCompanyData.email,
      phone: newCompanyData.phone,
      address: newCompanyData.address || 'Address not specified',
      owner: {
        name: newCompanyData.adminName,
        email: newCompanyData.adminEmail,
        avatar: newCompanyData.adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'
      },
      plan: newCompanyData.plan || 'Growth',
      billingCycle: newCompanyData.billingCycle || 'Monthly',
      price: planPrices[newCompanyData.plan] || '₹2,499 / mo',
      usersCount: 1,
      userLimit: Number(newCompanyData.userLimit) || (newCompanyData.plan === 'Starter' ? 5 : newCompanyData.plan === 'Growth' ? 20 : 100),
      status: newCompanyData.status || 'Active',
      joinedDate: 'Just now',
      renewalDate: 'Next month',
      metrics: {
        activeUsers: 1,
        storageUsed: '0.1 GB / 50 GB',
        leads: 0,
        customers: 0,
        deals: 0
      },
      recentActivity: [
        { id: 1, action: 'Organization provisioned by Super Admin', timestamp: 'Just now', user: 'Super Admin' }
      ]
    };

    setCompanies(prev => [newCompany, ...prev]);

    // Also add to mock subscriptions table
    const newSub = {
      id: `sub-${Date.now()}`,
      companyId: id,
      companyName: newCompany.name,
      plan: newCompany.plan,
      billingCycle: newCompany.billingCycle,
      amount: newCompany.price.split(' ')[0],
      status: newCompany.status,
      startDate: 'Today',
      renewalDate: newCompany.renewalDate,
      autoRenew: true
    };
    setSubscriptions(prev => [newSub, ...prev]);

    // Add activity
    setActivities(prev => [
      {
        id: Date.now(),
        title: 'New Company Onboarded',
        detail: `${newCompany.name} created on ${newCompany.plan} plan (${newCompany.status})`,
        time: 'Just now',
        type: 'company',
        iconColor: 'var(--tertiary)'
      },
      ...prev
    ]);

    return newCompany;
  };

  const updateCompanyStatus = (companyId, newStatus) => {
    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, status: newStatus } : c))
    );
    setSubscriptions(prev =>
      prev.map(s => (s.companyId === companyId ? { ...s, status: newStatus } : s))
    );
  };

  const deleteCompany = (companyId) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    setSubscriptions(prev => prev.filter(s => s.companyId !== companyId));
  };

  return (
    <SuperAdminContext.Provider
      value={{
        companies,
        subscriptions,
        plans,
        activities,
        stats: superAdminStats,
        revenueMonthlyData,
        subscriptionDistribution,
        generalSettings,
        setGeneralSettings,
        profileSettings,
        setProfileSettings,
        securitySettings,
        setSecuritySettings,
        notificationSettings,
        setNotificationSettings,
        platformPreferences,
        setPlatformPreferences,
        addCompany,
        updateCompanyStatus,
        deleteCompany
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
}
