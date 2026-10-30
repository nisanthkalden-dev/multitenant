import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi } from '../api/companyApi';
import { subscriptionApi } from '../api/subscriptionApi';
import { dashboardApi } from '../api/dashboardApi';
import { userApi } from '../api/userApi';
import { useAuth } from './AuthContext';
import {
  superAdminStats,
  revenueMonthlyData as defaultRevenueData,
  subscriptionDistribution as defaultSubDistribution,
  platformRecentActivities as defaultActivities
} from '../data/dashboard';
import { initialCompanies } from '../data/companies';
import { initialSubscriptions, subscriptionPlans } from '../data/subscriptions';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const { role } = useAuth();
  const [companies, setCompanies] = useState(initialCompanies);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [plans, setPlans] = useState(subscriptionPlans);
  const [activities, setActivities] = useState(defaultActivities);
  const [stats, setStats] = useState(superAdminStats);

  const [revenueMonthlyData, setRevenueMonthlyData] = useState(defaultRevenueData);
  const [revenueData, setRevenueData] = useState(defaultRevenueData);
  const [revenueData6M, setRevenueData6M] = useState(null);
  const [revenueData1Y, setRevenueData1Y] = useState(null);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState(defaultSubDistribution);
  const [distributionData, setDistributionData] = useState(defaultSubDistribution);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'NEXORA CRM',
    platformEmail: 'support@nexora.app',
    supportPhone: '+91 98765 00000',
    defaultCurrency: 'INR - ₹',
    defaultTimezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    logoUrl: null
  });

  // Profile Settings state
  const [profileSettings, setProfileSettings] = useState({
    fullName: 'Super Admin',
    email: 'superadmin@nexora.app',
    phone: '+91 98765 43210',
    userId: 'superadmin',
    avatarUrl: null
  });

  // Security Settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginActivity: [
      { id: 1, device: 'Chrome — Windows 11', location: 'Bengaluru, India', lastActive: 'Active now', current: true },
      { id: 2, device: 'Edge — Windows 11', location: 'Bengaluru, India', lastActive: '2 days ago', current: false }
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
      const availablePlans = await subscriptionApi.getSuperAdminPlans();
      if (Array.isArray(availablePlans) && availablePlans.length > 0) {
        setPlans(availablePlans);
      }
    } catch (err) {
      // Fallback to default plans
    }
  }, []);

  // Fetch Platform Settings from Backend
  const refreshSettings = useCallback(async () => {
    try {
      const { platformSettingsApi } = await import('../api/platformSettingsApi');
      const settings = await platformSettingsApi.getSettings();
      if (settings) {
        setGeneralSettings(prev => ({
          ...prev,
          platformName: settings.platformName || prev.platformName,
          platformEmail: settings.platformEmail || prev.platformEmail,
          supportPhone: settings.supportPhone || prev.supportPhone,
          defaultCurrency: settings.defaultCurrency || prev.defaultCurrency,
          defaultTimezone: settings.defaultTimezone || prev.defaultTimezone,
          dateFormat: settings.dateFormat || prev.dateFormat,
          logoUrl: settings.logoUrl || null
        }));
      }
    } catch (err) {
      console.warn('Could not fetch platform settings from backend:', err.message);
    }
  }, []);

  // Fetch Dashboard Metrics from Backend
  const refreshDashboard = useCallback(async (period = '6M') => {
    try {
      const dashboard = await dashboardApi.getSuperAdminDashboard(period);
      if (dashboard) {
        if (dashboard.stats) setStats(dashboard.stats);
        if (dashboard.revenueMonthlyData) {
          setRevenueData(dashboard.revenueMonthlyData);
          setRevenueMonthlyData(dashboard.revenueMonthlyData);
        }
        if (dashboard.revenueMonthlyData6M) setRevenueData6M(dashboard.revenueMonthlyData6M);
        if (dashboard.revenueMonthlyData1Y) setRevenueData1Y(dashboard.revenueMonthlyData1Y);
        if (dashboard.subscriptionDistribution) {
          setDistributionData(dashboard.subscriptionDistribution);
          setSubscriptionDistribution(dashboard.subscriptionDistribution);
        }
        if (dashboard.platformRecentActivities) {
          setActivities(dashboard.platformRecentActivities);
        }
      }
    } catch (err) {
      console.warn('Could not fetch super admin dashboard stats:', err.message);
    }
  }, []);

  // Fetch Current Super Admin Profile from Backend
  const refreshProfile = useCallback(async () => {
    try {
      const { userApi } = await import('../api/userApi');
      const res = await userApi.getProfile();
      if (res && res.data) {
        const u = res.data;
        setProfileSettings({
          fullName: u.fullName || u.name || 'Platform Super Admin',
          email: u.email || 'superadmin@nexora.com',
          phone: u.phone || '+91 98765 43210',
          userId: u.userId || 'superadmin',
          avatarUrl: u.avatar && u.avatar.length > 5 ? u.avatar : null
        });
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err.message);
    }
  }, []);

  // Aggregated refresh function
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.allSettled([
        refreshCompanies(),
        refreshSubscriptions(),
        refreshPlans(),
        refreshSettings(),
        refreshProfile(),
        refreshDashboard()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshCompanies, refreshSubscriptions, refreshPlans, refreshSettings, refreshProfile, refreshDashboard]);

  // Backward compatibility alias
  const refreshSuperAdminData = refreshAll;

  useEffect(() => {
    const rawSession = localStorage.getItem('nexora_auth_session');
    if (rawSession || role === 'super_admin') {
      refreshAll();
    }
  }, [role, refreshAll]);

  // Actions
  const addCompany = async (newCompanyData) => {
    const payload = {
      name: newCompanyData.name,
      email: newCompanyData.email,
      phone: newCompanyData.phone,
      address: newCompanyData.address,
      plan: newCompanyData.plan || 'Growth',
      billingCycle: newCompanyData.billingCycle || 'Monthly',
      price: newCompanyData.price,
      userLimit: Number(newCompanyData.userLimit) || 20,
      adminName: newCompanyData.adminName || `${newCompanyData.name} Admin`,
      adminEmail: newCompanyData.adminEmail || newCompanyData.email,
      adminPassword: newCompanyData.adminPassword
    };

    const created = await companyApi.createCompany(payload);
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
      throw err;
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      await companyApi.deleteCompany(companyId);
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete/suspend company:', err);
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      throw err;
    }
  };

  const saveProfileSettings = async (profileData) => {
    const res = await userApi.updateProfile({
      name: profileData.fullName,
      phone: profileData.phone,
      email: profileData.email
    });
    setProfileSettings(prev => ({
      ...prev,
      fullName: res.name || res.fullName || prev.fullName,
      phone: res.phone || prev.phone,
      email: res.email || prev.email
    }));
    return res;
  };

  const updateSubscriptionAction = async (id, subscriptionData) => {
    const updated = await subscriptionApi.updateSubscription(id, subscriptionData);
    await refreshAll();
    return updated;
  };

  const deleteSubscriptionAction = async (id) => {
    const res = await subscriptionApi.deleteSubscription(id);
    await refreshAll();
    return res;
  };

  const createPlanAction = async (planData) => {
    const res = await subscriptionApi.createPlan(planData);
    await refreshAll();
    return res;
  };

  const updatePlanAction = async (id, planData) => {
    const res = await subscriptionApi.updatePlan(id, planData);
    await refreshAll();
    return res;
  };

  const deletePlanAction = async (id) => {
    const res = await subscriptionApi.deletePlan(id);
    await refreshAll();
    return res;
  };

  const saveSettingsAction = async (settingsData) => {
    const { platformSettingsApi } = await import('../api/platformSettingsApi');
    const updated = await platformSettingsApi.updateSettings(settingsData);
    if (updated) {
      setGeneralSettings(prev => ({
        ...prev,
        platformName: updated.platformName || prev.platformName,
        platformEmail: updated.platformEmail || prev.platformEmail,
        supportPhone: updated.supportPhone || prev.supportPhone,
        defaultCurrency: updated.defaultCurrency || prev.defaultCurrency,
        defaultTimezone: updated.defaultTimezone || prev.defaultTimezone,
        dateFormat: updated.dateFormat || prev.dateFormat,
        logoUrl: updated.logoUrl || null
      }));
    }
    return updated;
  };

  const removeLogoAction = async () => {
    const { platformSettingsApi } = await import('../api/platformSettingsApi');
    const updated = await platformSettingsApi.removeLogo();
    setGeneralSettings(prev => ({
      ...prev,
      logoUrl: null
    }));
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
        revenueMonthlyData,
        subscriptionDistribution,
        loading,
        error,
        refreshSuperAdminData,
        revenueMonthlyData: revenueData,
        revenueMonthlyData6M: revenueData6M,
        revenueMonthlyData1Y: revenueData1Y,
        subscriptionDistribution: distributionData,
        generalSettings,
        setGeneralSettings,
        profileSettings,
        setProfileSettings,
        saveProfileSettings,
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
        deleteSubscriptionAction,
        createPlanAction,
        updatePlanAction,
        deletePlanAction,
        saveSettingsAction,
        removeLogoAction,
        refreshCompanies,
        refreshSubscriptions,
        refreshPlans,
        refreshSettings,
        refreshDashboard,
        refreshProfile,
        refreshAll
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
