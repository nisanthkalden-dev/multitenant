import React, { useState } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';

export default function CompanySettingsPage() {
  const { user, role } = useAuth();
  const [feedback, setFeedback] = useState('');

  // Editable profile state
  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 12345');

  // Company settings (Only visible / editable for company_admin)
  const [companyName, setCompanyName] = useState(user?.companyName || 'Acme Corporation');
  const [companyDomain, setCompanyDomain] = useState(user?.workspace || 'acme.nexora.app');
  const [currency, setCurrency] = useState('INR (₹)');

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback('Settings updated successfully in local state!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const isCompanyAdmin = role === 'company_admin';

  return (
    <CompanyLayout
      pageTitle={isCompanyAdmin ? 'Company & Account Settings' : 'My Account Profile'}
      pageSubtitle={`Preferences and configurations for ${user?.name} (${role})`}
    >
      {feedback && (
        <div className="auth-alert alert-success font-mono mb-4" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Personal Profile Section */}
        <div className="crm-panel-card mb-6">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Personal Credentials & Contact</h3>
              <p className="panel-card-subtitle">Your user identity in this organization</p>
            </div>
          </div>

          <div className="sa-form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input font-mono"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Direct Phone</label>
              <input
                type="text"
                className="form-input font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <input
                type="text"
                className="form-input font-mono"
                value={role}
                disabled
              />
              <span className="text-xs text-muted font-mono mt-1">Role tier managed by Company Admin</span>
            </div>
          </div>
        </div>

        {/* Company Settings (Company Admin Only) */}
        {isCompanyAdmin && (
          <div className="crm-panel-card mb-6">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Organization Preferences (Admin Only)</h3>
                <p className="panel-card-subtitle">Workspace governance and localization</p>
              </div>
            </div>

            <div className="sa-form-grid-2">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Workspace Subdomain</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={companyDomain}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Currency</label>
                <select
                  className="form-input font-mono"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                  <option value="USD ($)">USD - US Dollar ($)</option>
                  <option value="EUR (€)">EUR - Euro (€)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="sa-form-footer">
          <button type="submit" className="btn btn-primary font-mono">
            Save Changes
          </button>
        </div>
      </form>
    </CompanyLayout>
  );
}
