import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLE_PERMISSIONS, hasRouteAccess } from '../config/rolePermissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const active = authService.getSession();
    setSession(active);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const newSession = await authService.login(credentials);
      setSession(newSession);
      return newSession;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setSession(null);
  };

  const currentUser = session?.user || null;
  const currentRole = currentUser?.role || null;
  const companyId = currentUser?.companyId || null;
  const permissions = currentRole ? (ROLE_PERMISSIONS[currentRole] || {}) : {};

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session?.token,
        user: currentUser,
        role: currentRole,
        companyId,
        permissions,
        token: session?.token || null,
        loading,
        login,
        register,
        logout,
        hasAccess: (path) => hasRouteAccess(currentRole, path)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
