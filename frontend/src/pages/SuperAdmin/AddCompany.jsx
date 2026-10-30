import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';

export default function AddCompany() {
  const navigate = useNavigate();
  const { addCompany, plans } = useSuperAdmin();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    userLimit: 20,
    plan: plans && plans.length > 0 ? plans[0].name : 'Growth',
    billingCycle: 'Monthly',
    status: 'Active'
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'plan') {
      const selectedPlanObj = plans.find(p => p.name?.toLowerCase() === value?.toLowerCase());
      const newLimit = selectedPlanObj?.userLimit || 20;
      setFormData((prev) => ({ ...prev, plan: value, userLimit: newLimit }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (name === 'adminPassword' || name === 'confirmPassword') {
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: null }));
      }
    }
    if (apiError) setApiError('');
    if (serverError) {
      setServerError(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Company Name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Company Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid company email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Company Phone is required.';
    }

    // Company Administrator validation
    if (!formData.adminName.trim()) {
      errs.adminName = 'Administrator Name is required.';
    }

    if (!formData.adminEmail.trim()) {
      errs.adminEmail = 'Administrator Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
      errs.adminEmail = 'Please provide a valid administrator email address.';
    }

    if (!formData.adminPassword) {
      errs.adminPassword = 'Administrator Password is required.';
    } else if (formData.adminPassword.length < 6) {
      errs.adminPassword = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required.';
    } else if (formData.adminPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const planPrices = {
        Starter: '₹999',
        Growth: '₹2,499',
        Scale: '₹5,999'
      };

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address ? formData.address.trim() : null,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        price: planPrices[formData.plan] || '₹2,499',
        userLimit: Number(formData.userLimit) || 20,
        status: formData.status,
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPassword: formData.adminPassword
      };

      const created = await addCompany(payload);
      setFeedbackSuccess(true);
      setTimeout(() => {
        navigate(`/super-admin/companies/${created.id}`);
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Failed to create company. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add Company" breadcrumb={['Companies', 'Add Company']}>
      <div className="sa-form-container">
        {/* Page Header */}
        <div className="sa-form-header">
          <Link to="/super-admin/companies" className="sa-back-link font-mono">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Companies</span>
          </Link>
          <h2 className="sa-form-title">Add Company</h2>
          <p className="sa-form-subtitle">
            Create and configure a new company workspace in Nexora CRM.
          </p>
        </div>

        {feedbackSuccess && (
          <div className="auth-alert alert-success font-mono mb-4" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Company provisioned successfully! Redirecting to company overview...</span>
          </div>
        )}

        {apiError && (
          <div className="auth-alert alert-error font-mono mb-4" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="sa-form-wrapper">
          {/* Card 1: Company Information */}
          <section className="sa-form-card" aria-labelledby="company-info-heading">
            <header className="sa-form-card-header">
              <div className="sa-section-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"></path>
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  <line x1="9" y1="13" x2="9.01" y2="13"></line>
                  <line x1="15" y1="13" x2="15.01" y2="13"></line>
                  <line x1="9" y1="17" x2="9.01" y2="17"></line>
                  <line x1="15" y1="17" x2="15.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 id="company-info-heading" className="sa-form-card-title">Company Information</h3>
                <p className="sa-form-card-subtitle">Enter the basic organization and contact details.</p>
              </div>
            </header>

            <div className="sa-form-grid-2">
              {/* Company Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span>Company Name <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className={`form-input font-mono sa-input-with-icon ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Apex Dynamics"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.name && <span className="field-error font-mono">{errors.name}</span>}
              </div>

              {/* Company Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span>Company Email <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className={`form-input font-mono sa-input-with-icon ${errors.email ? 'input-error' : ''}`}
                    placeholder="contact@apexdynamics.io"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && <span className="field-error font-mono">{errors.email}</span>}
              </div>

              {/* Company Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <span>Company Phone <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </span>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    className={`form-input font-mono sa-input-with-icon ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.phone && <span className="field-error font-mono">{errors.phone}</span>}
              </div>

              {/* Company Address */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  <span>Company Address</span>
                  <span className="form-label-optional font-mono">Optional</span>
                </label>
                <div className="sa-input-wrapper sa-input-wrapper-textarea">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </span>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    className="form-input sa-input-with-icon"
                    placeholder="Headquarters address, city, state, country"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Initial Company Administrator */}
          <section className="sa-form-card" aria-labelledby="admin-info-heading">
            <header className="sa-form-card-header">
              <div className="sa-section-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 id="admin-info-heading" className="sa-form-card-title">Company Administrator</h3>
                <p className="sa-form-card-subtitle">Initial admin account for managing this company's workspace.</p>
              </div>
            </header>

            <div className="sa-form-grid-2">
              {/* Admin Name */}
              <div className="form-group">
                <label htmlFor="adminName" className="form-label">
                  <span>Administrator Name <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="7" r="4"></circle>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    </svg>
                  </span>
                  <input
                    id="adminName"
                    type="text"
                    name="adminName"
                    className={`form-input font-mono sa-input-with-icon ${errors.adminName ? 'input-error' : ''}`}
                    placeholder="e.g. Rahul Sharma"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.adminName && <span className="field-error font-mono">{errors.adminName}</span>}
              </div>

              {/* Admin Email */}
              <div className="form-group">
                <label htmlFor="adminEmail" className="form-label">
                  <span>Administrator Email <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    id="adminEmail"
                    type="email"
                    name="adminEmail"
                    className={`form-input font-mono sa-input-with-icon ${errors.adminEmail ? 'input-error' : ''}`}
                    placeholder="admin@apexdynamics.io"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.adminEmail && <span className="field-error font-mono">{errors.adminEmail}</span>}
              </div>

              {/* Admin Password */}
              <div className="form-group">
                <label htmlFor="adminPassword" className="form-label">
                  <span>Administrator Password <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper password-input-wrap">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="adminPassword"
                    type={showAdminPassword ? 'text' : 'password'}
                    name="adminPassword"
                    className={`form-input font-mono sa-input-with-icon ${errors.adminPassword ? 'input-error' : ''}`}
                    placeholder="Enter password (min. 6 characters)"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    aria-label={showAdminPassword ? 'Hide administrator password' : 'Show administrator password'}
                    title={showAdminPassword ? 'Hide administrator password' : 'Show administrator password'}
                  >
                    {showAdminPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.adminPassword && <span className="field-error font-mono">{errors.adminPassword}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <span>Confirm Password <span className="text-danger">*</span></span>
                </label>
                <div className="sa-input-wrapper password-input-wrap">
                  <span className="sa-input-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input font-mono sa-input-with-icon ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter administrator password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error font-mono">{errors.confirmPassword}</span>}
              </div>
            </div>
          </section>

          {/* Card 3: Subscription & Licensing */}
          <section className="sa-form-card" aria-labelledby="subscription-licensing-heading">
            <header className="sa-form-card-header">
              <div className="sa-section-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div>
                <h3 id="subscription-licensing-heading" className="sa-form-card-title">Subscription & Licensing</h3>
                <p className="sa-form-card-subtitle">Configure the subscription plan, billing cycle, and seat limit.</p>
              </div>
            </header>

            <div className="sa-form-grid-2">
              {/* Subscription Plan */}
              <div className="form-group">
                <label htmlFor="plan" className="form-label">
                  <span>Plan</span>
                </label>
                <select
                  id="plan"
                  name="plan"
                  className="form-input font-mono"
                  value={formData.plan}
                  onChange={handleChange}
                >
                  {plans && plans.length > 0 ? (
                    plans.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.userLimit} Seats — ₹{p.monthlyPrice})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Starter">Starter (5 Seats — ₹999)</option>
                      <option value="Growth">Growth (20 Seats — ₹2,499)</option>
                      <option value="Scale">Scale (50 Seats — ₹5,999)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Billing Cycle */}
              <div className="form-group">
                <label htmlFor="billingCycle" className="form-label">
                  <span>Billing Cycle</span>
                </label>
                <select
                  id="billingCycle"
                  name="billingCycle"
                  className="form-input font-mono"
                  value={formData.billingCycle}
                  onChange={handleChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual (Save 20%)</option>
                </select>
              </div>

              {/* User Limit */}
              <div className="form-group">
                <label htmlFor="userLimit" className="form-label">
                  <span>User Limit (Seats)</span>
                </label>
                <input
                  id="userLimit"
                  type="number"
                  min="1"
                  max="1000"
                  name="userLimit"
                  className="form-input font-mono"
                  value={formData.userLimit}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  <span>Status</span>
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input font-mono"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </section>

          {/* Form Actions Footer */}
          <div className="sa-form-footer">
            <button
              type="button"
              className="btn btn-secondary font-mono"
              onClick={() => navigate('/super-admin/companies')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary font-mono"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading-wrap">
                  <span className="spinner-dot"></span>
                  <span>Company Added Successfully...</span>
                </span>
              ) : (
                'Create Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
