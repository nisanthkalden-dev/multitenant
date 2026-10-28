import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    userId: '',
    email: '',
    role: 'Admin',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }

    if (!formData.userId.trim()) {
      errs.userId = 'User ID is required.';
    } else if (formData.userId.trim().length < 3) {
      errs.userId = 'User ID must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.userId.trim())) {
      errs.userId = 'User ID can only contain letters, numbers, and underscores.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Email address is invalid.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (
      !passwordRules.minLength ||
      !passwordRules.hasUpper ||
      !passwordRules.hasLower ||
      !passwordRules.hasNumber
    ) {
      errs.password =
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      await register({
        fullName: formData.fullName,
        userId: formData.userId,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });

      // Redirect to /login with success message
      navigate('/login', {
        state: { message: `Account created successfully as ${formData.role}. Please log in.` }
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        {/* Left Branding Side Panel for SaaS CRM Registration */}
        <div className="auth-brand-panel">
          <div className="auth-brand-top">
            <Link to="/" className="logo auth-logo-panel" aria-label="Nexora CRM Home">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
              <span className="logo-badge">saas</span>
            </Link>
            <span className="auth-platform-tag font-mono">Workspace Provisioning</span>
          </div>

          <div className="auth-brand-body">
            <h2 className="auth-brand-heading">
              Deploy Your Organization Workspace in Seconds
            </h2>
            <p className="auth-brand-desc">
              Get immediate access to dedicated sales pipelines, lead management, and team hierarchy designed for growth.
            </p>

            <div className="auth-brand-features">
              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Immediate Role Assignment</div>
                  <div className="feature-desc">Provision as Admin, Manager, Team Lead, or Employee</div>
                </div>
              </div>

              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Encrypted Storage &amp; Isolation</div>
                  <div className="feature-desc">All customer records partitioned securely</div>
                </div>
              </div>

              <div className="auth-brand-feature-item">
                <div className="feature-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Zero Configuration Setup</div>
                  <div className="feature-desc">Pre-configured deals, Kanban pipelines, and task lists</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer font-mono">
            <span className="security-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              High-Availability Multi-Tenant Infrastructure
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-card register-card">
          {/* Brand Logo (mobile visible) */}
          <div className="auth-header">
            <Link to="/" className="logo auth-logo auth-mobile-logo" aria-label="Nexora CRM Home">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
              <span className="logo-badge">saas</span>
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start using your multi-tenant CRM workspace</p>
          </div>

          {/* Form-Level Server / Duplicate Error */}
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

          {/* Registration Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={submitting}
                  required
                />
              </div>
              {errors.fullName && (
                <span className="field-error font-mono">{errors.fullName}</span>
              )}
            </div>

            {/* User ID */}
            <div className="form-group">
              <label htmlFor="userId" className="form-label">
                User ID
              </label>
              <div className="input-wrapper">
                <input
                  id="userId"
                  type="text"
                  name="userId"
                  className={`form-input font-mono ${errors.userId ? 'input-error' : ''}`}
                  placeholder="Create a User ID"
                  value={formData.userId}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={submitting}
                  required
                />
              </div>
              {errors.userId && (
                <span className="field-error font-mono">{errors.userId}</span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`form-input font-mono ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
              {errors.email && (
                <span className="field-error font-mono">{errors.email}</span>
              )}
            </div>

            {/* Company Role Selection */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Company Role
              </label>
              <div className="input-wrapper">
                <select
                  id="role"
                  name="role"
                  className="form-input font-mono"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Admin">Admin (Workspace Admin)</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Assigned role inside your company workspace
              </span>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input font-mono ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

              {/* Password Requirements Guide */}
              <div className="password-rules-guide">
                <span className={`rule-item ${passwordRules.minLength ? 'valid' : ''}`}>
                  &bull; Min 8 characters
                </span>
                <span className={`rule-item ${passwordRules.hasUpper ? 'valid' : ''}`}>
                  &bull; Uppercase letter
                </span>
                <span className={`rule-item ${passwordRules.hasLower ? 'valid' : ''}`}>
                  &bull; Lowercase letter
                </span>
                <span className={`rule-item ${passwordRules.hasNumber ? 'valid' : ''}`}>
                  &bull; Number
                </span>
              </div>

              {errors.password && (
                <span className="field-error font-mono">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-wrapper password-input-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input font-mono ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <span className="field-error font-mono">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-loading-wrap">
                  <span className="spinner-dot"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="auth-footer">
            <span className="auth-footer-text">Already have an account?</span>{' '}
            <Link to="/login" className="auth-link">
              Log In
            </Link>
          </div>

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
