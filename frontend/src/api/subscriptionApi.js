import { apiClient } from './apiClient';

export const subscriptionApi = {
  // Super Admin operations
  getAllSubscriptions: async ({ page = 0, size = 100 } = {}) => {
    const params = new URLSearchParams({ page, size });
    const res = await apiClient(`/super-admin/subscriptions?${params.toString()}`);
    return res;
  },

  getSubscriptionById: async (id) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`);
    return res.data;
  },

  updateSubscription: async (id, subscriptionData) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`, {
      method: 'PUT',
      body: subscriptionData
    });
    return res.data;
  },

  // Super Admin Plan Management
  getSuperAdminPlans: async () => {
    const res = await apiClient('/super-admin/plans');
    return res.data;
  },

  createPlan: async (planData) => {
    const res = await apiClient('/super-admin/plans', {
      method: 'POST',
      body: planData
    });
    return res.data;
  },

  updatePlan: async (id, planData) => {
    const res = await apiClient(`/super-admin/plans/${id}`, {
      method: 'PUT',
      body: planData
    });
    return res.data;
  },

  deletePlan: async (id) => {
    const res = await apiClient(`/super-admin/plans/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  // Tenant Company operations
  getPlans: async () => {
    const res = await apiClient('/subscription/plans');
    return res.data;
  },

  getCurrentSubscription: async () => {
    const res = await apiClient('/subscription');
    return res.data;
  },

  upgradeSubscription: async (subscriptionData) => {
    const res = await apiClient('/subscription', {
      method: 'POST',
      body: subscriptionData
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient('/subscription/history');
    return res.data;
  }
};
