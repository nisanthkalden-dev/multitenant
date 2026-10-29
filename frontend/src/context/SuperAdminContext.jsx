import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyApi } from '../api/companyApi';
import { subscriptionApi } from '../api/subscriptionApi';
import { dashboardApi } from '../api/dashboardApi';
import { userApi } from '../api/userApi';
import { useAuth } from './AuthContext';
import { revenueMonthlyData as defaultRevenueData, subscriptionDistribution as defaultSubDistribution, platformRecentActivities as defaultActivities } from '../data/dashboard';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const { role } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activities, setActivities] = useState(defaultActivities);
  const [stats, setStats] = useState({
    totalCompanies: { value: '0', growth: '+0%', trend: 'up' },
    activeCompanies: { value: '0', growth: '+0%', trend: 'up' },
    totalUsers: { value: '0', growth: '+0%', trend: 'up' },
    activeSubscriptions: { value: '0', growth: '+0%', trend: 'up' },
    monthlyRevenue: { value: '₹0', growth: '+0%', trend: 'up' },
    avgSubscriptionValue: { value: '₹0', growth: '+0%', trend: 'up' }
  });
  const [revenueMonthlyData, setRevenueMonthlyData] = useState(defaultRevenueData);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState(defaultSubDistribution);
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

  // Fetch Super Admin platform data from Backend
  const refreshSuperAdminData = useCallback(async () => {
    if (role !== 'super_admin') return;
    setLoading(true);
    setError(null);
    try {
      const [dashRes, compRes, subsRes, plansRes] = await Promise.all([
        dashboardApi.getSuperAdminDashboard().catch(() => null),
        companyApi.getCompanies({ page: 0, size: 100 }).catch(() => null),
        subscriptionApi.getAllSubscriptions().catch(() => null),
        subscriptionApi.getPlans().catch(() => null)
      ]);

      if (dashRes) {
        if (dashRes.stats) setStats(dashRes.stats);
        if (dashRes.revenueMonthlyData) setRevenueMonthlyData(dashRes.revenueMonthlyData);
        if (dashRes.subscriptionDistribution) setSubscriptionDistribution(dashRes.subscriptionDistribution);
        if (dashRes.platformRecentActivities) setActivities(dashRes.platformRecentActivities);
      }

      if (compRes?.data) {
        setCompanies(compRes.data);
      }

      if (subsRes?.data) {
        setSubscriptions(subsRes.data);
      }

      if (plansRes && Array.isArray(plansRes)) {
        setPlans(plansRes);
      }
    } catch (err) {
      console.error('Failed to load super admin data from API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role === 'super_admin') {
      refreshSuperAdminData();
    }
  }, [role, refreshSuperAdminData]);

  // Actions connecting to real backend API
  const addCompany = async (newCompanyData) => {
    const payload = {
      name: newCompanyData.name,
      email: newCompanyData.email,
      phone: newCompanyData.phone,
      address: newCompanyData.address,
      plan: newCompanyData.plan || 'Growth',
      billingCycle: newCompanyData.billingCycle || 'Monthly',
      userLimit: Number(newCompanyData.userLimit) || 20,
      adminName: newCompanyData.adminName || `${newCompanyData.name} Admin`,
      adminEmail: newCompanyData.adminEmail || newCompanyData.email
    };

    const created = await companyApi.createCompany(payload);
    await refreshSuperAdminData();
    return created;
  };

  const updateCompanyStatus = async (companyId, newStatus) => {
    await companyApi.updateCompany(companyId, { status: newStatus });
    await refreshSuperAdminData();
  };

  const deleteCompany = async (companyId) => {
    await companyApi.deleteCompany(companyId);
    await refreshSuperAdminData();
  };

  // Profile and Password persistence
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
