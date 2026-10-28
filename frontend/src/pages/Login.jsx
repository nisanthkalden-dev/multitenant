import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Tab State: 'company' | 'super_admin'
  const [loginType, setLoginType] = useState('company');

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success message passed from registration page redirection if any
  const registrationSuccessMessage = location.state?.message;

  const handleTabChange = (type) => {
    setLoginType(type);
    setServerError('');
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!userId.trim()) {
      errs.userId = loginType === 'super_admin'
        ? 'Super Admin User ID / Email is required.'
        : 'User ID or Work Email is required.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const session = await login({ userId, password, loginType });
      // Redirect based on role / account type
      let defaultDest = '/company/dashboard';
      if (session?.user?.role === 'super_admin' || session?.user?.accountType === 'super_admin') {
        defaultDest = '/super-admin';
      }
      const destination = location.state?.from?.pathname || defaultDest;
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid User ID or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill helper for testing demo credentials
  const fillCredentials = (u, p) => {
    setUserId(u);
    setPassword(p);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-top-actions">
        <ThemeToggle />
      </div>

      <div className="hero-bg-fx" aria-hidden="true">
        <div className="bg-grid-pattern"></div>
        <div className="bg-radial-glow primary-glow"></div>
        <div className="bg-radial-glow secondary-glow"></div>
      </div>

      <div className="auth-container auth-container-split">
        {/* Left Branding Side Panel for SaaS CRM */}
        <div className="auth-brand-panel">
          <div className="auth-brand-top">
            <Link to="/" className="logo auth-logo-panel" aria-label="Nexora CRM Home">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
              <span className="logo-badge">saas</span>
            </Link>
            <span className="auth-platform-tag font-mono">Enterprise B2B Cloud</span>
          </div>

          <div className="auth-brand-body">
            <h2 className="auth-brand-heading">
              Intelligent Multi-Tenant Workspace & Revenue Pipeline
            </h2>
            <p className="auth-brand-desc">
              Centralize your lead discovery, deal stages, and cross-functional team collaboration with zero data cross-leakage.
            </p>

            <div className="auth-brand-features">
              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Role-Based Access Control</div>
                  <div className="feature-desc">Automated clearance for Admins, Managers, and Employees</div>
                </div>
              </div>

              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Multi-Tenant Partitioning</div>
                  <div className="feature-desc">Strict logical schema separation per organization</div>
                </div>
              </div>

              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Real-Time Commercial Metrics</div>
                  <div className="feature-desc">Automated pipeline velocity, tasks, and team audits</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer font-mono">
            <span className="security-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              SOC2 Type II &amp; ISO-27001 Certified Architecture
            </span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="auth-card">
          {/* Brand Logo (mobile visible) */}
          <div className="auth-header">
            <Link to="/" className="logo auth-logo auth-mobile-logo" aria-label="Nexora CRM Home">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
              <span className="logo-badge">saas</span>
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              {loginType === 'super_admin'
                ? 'Sign in to Central Control & Platform Governance'
                : 'Sign in to your organization workspace'}
            </p>
          </div>

          {/* Option A: Segmented Tab Switcher */}
          <div className="login-type-tabs" role="tablist" aria-label="Login Type">
            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'company'}
              className={`login-type-tab ${loginType === 'company' ? 'active' : ''}`}
              onClick={() => handleTabChange('company')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>Company Login</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'super_admin'}
              className={`login-type-tab ${loginType === 'super_admin' ? 'active' : ''}`}
              onClick={() => handleTabChange('super_admin')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Super Admin</span>
            </button>
          </div>

          {/* Info pill about current login type */}
          {loginType === 'super_admin' ? (
            <div className="login-type-badge-info super-admin-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                <strong>Platform Master:</strong> Restricted to platform owners managing tenant infrastructure and global accounts.
              </span>
            </div>
          ) : (
            <div className="login-type-badge-info company-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                <strong>Company Account Login:</strong> Log in with your User ID and password. Your role (Company Admin, Manager, or Employee) is automatically detected to load your authorized workspace.
              </span>
            </div>
          )}

          {/* Registration success feedback notice */}
          {registrationSuccessMessage && !serverError && (
            <div className="auth-alert alert-success" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{registrationSuccessMessage}</span>
            </div>
          )}

          {/* Form Level Error Message */}
          {serverError && (
            <div className="auth-alert alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* User ID / Email Field */}
            <div className="form-group">
              <label htmlFor="userId" className="form-label">
                {loginType === 'super_admin' ? 'Super Admin ID or Email' : 'User ID or Work Email'}
              </label>
              <div className="input-wrapper">
                <input
                  id="userId"
                  type="text"
                  name="userId"
                  className={`form-input font-mono ${errors.userId ? 'input-error' : ''}`}
                  placeholder={
                    loginType === 'super_admin'
                      ? 'e.g. superadmin or superadmin@nexora.app'
                      : 'e.g. admin, manager, teamlead, or employee'
                  }
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }));
                  }}
                  autoComplete="username"
                  disabled={submitting}
                  required
                />
              </div>
              {errors.userId && (
                <span className="field-error font-mono">{errors.userId}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                {loginType === 'company' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => alert('Password reset is managed by your organization workspace administrator. Contact admin@acmecorp.com or your IT department.')}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-wrapper password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input font-mono ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="current-password"
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="field-error font-mono">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-loading-wrap">
                  <span className="spinner-dot"></span>
                  <span>Authenticating...</span>
                </span>
              ) : loginType === 'super_admin' ? (
                'Log In as Super Admin'
              ) : (
                'Log In to Workspace'
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="demo-creds-box">
            <div className="demo-creds-title">
              <span>Quick Demo Accounts</span>
              <span className="font-mono" style={{ fontSize: '0.72rem' }}>Pass: Password123 / SuperAdmin123!</span>
            </div>
            {loginType === 'super_admin' ? (
              <div className="demo-creds-list">
                <button
                  type="button"
                  className="demo-cred-btn"
                  onClick={() => fillCredentials('superadmin', 'SuperAdmin123!')}
                >
                  <span className="demo-cred-role font-mono">Super Admin</span>
                  <span className="demo-cred-pill font-mono">superadmin</span>
                </button>
              </div>
            ) : (
              <div className="demo-creds-list">
                <button
                  type="button"
                  className="demo-cred-btn"
                  onClick={() => fillCredentials('admin', 'Password123')}
                >
                  <span className="demo-cred-role font-mono">Company Admin</span>
                  <span className="demo-cred-pill font-mono">admin</span>
                </button>
                <button
                  type="button"
                  className="demo-cred-btn"
                  onClick={() => fillCredentials('manager', 'Password123')}
                >
                  <span className="demo-cred-role font-mono">Manager</span>
                  <span className="demo-cred-pill font-mono">manager</span>
                </button>
                <button
                  type="button"
                  className="demo-cred-btn"
                  onClick={() => fillCredentials('employee', 'Password123')}
                >
                  <span className="demo-cred-role font-mono">Employee</span>
                  <span className="demo-cred-pill font-mono">employee</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {loginType === 'company' && (
            <div className="auth-footer">
              <span className="auth-footer-text">Don't have an account?</span>{' '}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </div>
          )}

          <div className="auth-back-home">
            <Link to="/" className="back-link">
              &larr; Back to Nexora CRM
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
