// Centralized Authentication Service layer connected to Spring Boot Backend API
import { authApi } from '../api/authApi';

const STORAGE_SESSION_KEY = 'nexora_auth_session';

export const authService = {
  /**
   * Log in user against the Spring Boot REST API
   */
  async login({ userId, password, loginType = 'company' }) {
    const authData = await authApi.login({ userId, password, loginType });

    const session = {
      token: authData.token,
      user: {
        id: authData.user.id,
        userId: authData.user.userId,
        name: authData.user.name || authData.user.fullName,
        fullName: authData.user.fullName || authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        companyId: authData.user.companyId,
        companyName: authData.user.companyName,
        workspace: authData.user.workspace,
        avatar: authData.user.avatar || 'US',
        department: authData.user.department || 'Workspace',
        phone: authData.user.phone,
        status: authData.user.status || 'Active'
      },
      expiresAt: authData.expiresAt || Date.now() + 24 * 60 * 60 * 1000
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Register new company user via backend API
   */
  async register(registrationData) {
    const result = await authApi.register(registrationData);
    return {
      success: true,
      message: 'Account created successfully. You can now log in.',
      user: result
    };
  },

  /**
   * Fetch current session info from backend
   */
  async fetchCurrentUser() {
    return await authApi.getCurrentUser();
  },

  getSession() {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  logout() {
    try {
      authApi.logout();
    } catch {
      // Ignored
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
};
