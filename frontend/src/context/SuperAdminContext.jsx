import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialCompanies } from '../data/companies';
import { initialSubscriptions, subscriptionPlans } from '../data/subscriptions';
import { superAdminStats, revenueMonthlyData, subscriptionDistribution, platformRecentActivities } from '../data/dashboard';
import { companyApi } from '../api/companyApi';
import { subscriptionApi } from '../api/subscriptionApi';
import { dashboardApi } from '../api/dashboardApi';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [plans, setPlans] = useState(subscriptionPlans);
  const [activities, setActivities] = useState(platformRecentActivities);
  const [stats, setStats] = useState(superAdminStats);
  const [revenueData, setRevenueData] = useState(revenueMonthlyData);
  const [distributionData, setDistributionData] = useState(subscriptionDistribution);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch Companies from Backend
  const refreshCompanies = useCallback(async () => {
    try {
      const res = await companyApi.getCompanies({ page: 0, size: 100 });
      const companyList = res.data || [];
      setCompanies(companyList);
      return companyList;
    } catch (err) {
      console.warn('Could not fetch companies from backend:', err.message);
      return [];
    }
  }, []);

  // Fetch Subscriptions from Backend
  const refreshSubscriptions = useCallback(async () => {
    try {
      const res = await subscriptionApi.getAllSubscriptions({ page: 0, size: 100 });
      const subsList = res.data || [];
      setSubscriptions(subsList);
      return subsList;
    } catch (err) {
      console.warn('Could not fetch subscriptions from backend:', err.message);
      return [];
    }
  }, []);

  // Fetch Plans from Backend
  const refreshPlans = useCallback(async () => {
    try {
      const availablePlans = await subscriptionApi.getPlans();
      if (Array.isArray(availablePlans) && availablePlans.length > 0) {
        setPlans(availablePlans);
      }
    } catch (err) {
      // Fallback to static plan configuration
    }
  }, []);

  // Fetch Dashboard Metrics from Backend
  const refreshDashboard = useCallback(async () => {
    try {
      const dashboard = await dashboardApi.getSuperAdminDashboard();
      if (dashboard) {
        if (dashboard.stats) setStats(dashboard.stats);
        if (dashboard.revenueMonthlyData) setRevenueData(dashboard.revenueMonthlyData);
        if (dashboard.subscriptionDistribution) setDistributionData(dashboard.subscriptionDistribution);
      }
    } catch (err) {
      console.warn('Could not fetch super admin dashboard stats:', err.message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.allSettled([
        refreshCompanies(),
        refreshSubscriptions(),
        refreshPlans(),
        refreshDashboard()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshCompanies, refreshSubscriptions, refreshPlans, refreshDashboard]);

  useEffect(() => {
    // Only attempt fetch if user has active session
    const rawSession = localStorage.getItem('nexora_auth_session');
    if (rawSession) {
      refreshAll();
    }
  }, [refreshAll]);

  // Actions
  const addCompany = async (newCompanyData) => {
    // Call backend API to provision tenant in MySQL
    const created = await companyApi.createCompany(newCompanyData);
    // Refresh list, subscriptions, and dashboard to reflect live database state
    await refreshAll();
    return created;
  };

  const updateCompanyStatus = async (companyId, newStatus) => {
    try {
      await companyApi.updateCompany(companyId, { status: newStatus });
      await refreshAll();
    } catch (err) {
      console.error('Failed to update company status:', err);
      setCompanies(prev =>
        prev.map(c => (c.id === companyId ? { ...c, status: newStatus } : c))
      );
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      await companyApi.deleteCompany(companyId);
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete/suspend company:', err);
      setCompanies(prev => prev.filter(c => c.id !== companyId));
    }
  };

  const updateSubscriptionAction = async (id, subscriptionData) => {
    const updated = await subscriptionApi.updateSubscription(id, subscriptionData);
    await refreshAll();
    return updated;
  };

  return (
    <SuperAdminContext.Provider
      value={{
        companies,
        subscriptions,
        plans,
        activities,
        stats,
        revenueMonthlyData: revenueData,
        subscriptionDistribution: distributionData,
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
        deleteCompany,
        updateSubscriptionAction,
        refreshCompanies,
        refreshSubscriptions,
        refreshPlans,
        refreshDashboard,
        refreshAll,
        loading,
        error
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
