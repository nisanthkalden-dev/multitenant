// Centralized Authentication Service layer connected to Spring Boot Backend API
import { authApi } from '../api/authApi';

const STORAGE_SESSION_KEY = 'nexora_auth_session';

export const authService = {
  /**
   * Log in user against the Spring Boot REST API
   * Handles both Company User Login and Dedicated Super Admin Login
   */
  async login({ userId, password, loginType = 'company' }) {
    let authData;
    if (loginType === 'super_admin') {
      authData = await authApi.superAdminLogin({ email: userId, password });
    } else {
      authData = await authApi.login({ userId, password, loginType });
    }

    const accessToken = authData.accessToken;
    const refreshToken = authData.refreshToken;
    const tokenType = authData.tokenType || 'Bearer';

    // Helper to decode JWT payload safely
    const parseJwtClaims = (jwt) => {
      try {
        if (!jwt || typeof jwt !== 'string') return {};
        const parts = jwt.split('.');
        if (parts.length < 2) return {};
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return {};
      }
    };

    const claims = parseJwtClaims(accessToken);

    let userObj = authData.user;
    if (!userObj) {
      const roleStr = (claims.role || 'SUPER_ADMIN').toLowerCase();
      userObj = {
        id: claims.userId || null,
        userId: claims.userIdentifier || claims.sub || 'superadmin',
        name: claims.fullName || 'Platform Super Admin',
        fullName: claims.fullName || 'Platform Super Admin',
        email: claims.email || claims.sub || 'superadmin@nexora.com',
        role: roleStr,
        companyId: claims.companyId || null,
        companyName: claims.companyName || null,
        workspace: claims.workspace || null,
        avatar: roleStr.includes('super_admin') ? 'SA' : 'US',
        department: 'Platform Operations',
        phone: null,
        status: 'Active'
      };
    }

    const session = {
      accessToken,
      token: accessToken,
      refreshToken,
      tokenType,
      expiresIn: authData.expiresIn || 900,
      user: {
        id: userObj.id,
        userId: userObj.userId,
        name: userObj.name || userObj.fullName,
        fullName: userObj.fullName || userObj.name,
        email: userObj.email,
        role: userObj.role,
        companyId: userObj.companyId,
        companyName: userObj.companyName,
        workspace: userObj.workspace,
        avatar: userObj.avatar || (userObj.role === 'super_admin' ? 'SA' : 'US'),
        department: userObj.department || 'Workspace',
        phone: userObj.phone,
        status: userObj.status || 'Active'
      },
      expiresAt: claims.exp ? claims.exp * 1000 : (Date.now() + 900000)
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Dedicated Super Admin Login
   */
  async superAdminLogin({ email, password }) {
    return this.login({ userId: email, password, loginType: 'super_admin' });
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
