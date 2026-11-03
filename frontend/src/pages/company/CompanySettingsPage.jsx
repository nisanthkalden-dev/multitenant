import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/settingsApi';

export default function CompanySettingsPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'organization' | 'security'
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Company settings (Only visible / editable for company_admin)
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [leadRouting, setLeadRouting] = useState('Round Robin');

  const isCompanyAdmin = role === 'company_admin';

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const [profile, compSettings] = await Promise.all([
          settingsApi.getUserProfile().catch(() => null),
          isCompanyAdmin ? settingsApi.getCompanySettings().catch(() => null) : Promise.resolve(null)
        ]);

        if (profile) {
          setName(profile.name || profile.fullName || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
        } else {
          setName(user?.name || user?.fullName || '');
          setEmail(user?.email || '');
        }

        if (compSettings) {
          setCompanyName(compSettings.companyName || user?.companyName || '');
          setCompanyDomain(compSettings.workspace || user?.workspace || '');
          setCurrency(compSettings.currency || 'INR');
          setTimezone(compSettings.timezone || 'Asia/Kolkata');
          setLeadRouting(compSettings.leadRouting || 'Round Robin');
        } else {
          setCompanyName(user?.companyName || '');
          setCompanyDomain(user?.workspace || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [isCompanyAdmin, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');

    try {
      await settingsApi.updateUserProfile({
        name,
        fullName: name,
        phone,
        email
      });

      if (isCompanyAdmin) {
        await settingsApi.updateCompanySettings({
          companyName,
          currency,
          timezone,
          leadRouting
        });
      }

      setFeedback('Settings updated and persisted successfully to database!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwdError('Current password and new password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }

    setPwdError('');
    setPwdFeedback('');
    try {
      await settingsApi.changePassword({
        currentPassword,
        newPassword
      });
      setPwdFeedback('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdFeedback(''), 4000);
    } catch (err) {
      setPwdError(err.message || 'Failed to change password');
    }
  };

  return (
    <CompanyLayout
      pageTitle={isCompanyAdmin ? 'Company & Account Settings' : 'My Account Profile'}
      pageSubtitle={`Preferences, workspace governance, and credentials for ${user?.name || 'User'} (${user?.companyName || 'Organization'})`}
    >
      {feedback && (
        <div className="auth-alert alert-success font-mono mb-4" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="auth-alert alert-error font-mono mb-4" role="alert">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="crm-panel-card text-center p-5 font-mono text-muted">
          Loading workspace configuration from database...
        </div>
      ) : (
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Summary Banner Card */}
          <div className="crm-panel-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--secondary), var(--tertiary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#ffffff'
                }}
              >
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ margin: 0 }}>{user?.name || 'Workspace Administrator'}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="status-pill status-active font-mono text-xs">
                    {user?.companyName || companyName || 'Company Tenant'}
                  </span>
                  <span className="font-mono text-xs text-muted">&bull;</span>
                  <span className="font-mono text-xs text-muted">{user?.email || email}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-xs font-mono ${activeTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('general')}
              >
                Personal Profile
              </button>
              {isCompanyAdmin && (
                <button
                  type="button"
                  className={`btn btn-xs font-mono ${activeTab === 'organization' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('organization')}
                >
                  Organization Governance
                </button>
              )}
              <button
                type="button"
                className={`btn btn-xs font-mono ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('security')}
              >
                Security & Password
              </button>
            </div>
          </div>

          {/* TAB 1: Personal Profile */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile}>
              <div className="crm-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Personal Credentials & Contact Details</h3>
                    <p className="panel-card-subtitle">Your user identity stored in the company tenant directory</p>
                  </div>
                  <span className="status-pill font-mono text-xs" style={{ background: 'var(--bg-subtle-box)', color: 'var(--text-muted)' }}>
                    Role: {role}
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div className="sa-form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="e.g. Alex Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Corporate Email Address *</label>
                      <input
                        type="email"
                        className="form-input font-mono"
                        placeholder="alex@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Direct Phone Number</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assigned Authorization Tier</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={role}
                        disabled
                        style={{ opacity: 0.75, cursor: 'not-allowed' }}
                      />
                      <span className="font-mono text-xs text-muted" style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                        Security level managed by workspace owner
                      </span>
                    </div>
                  </div>
                </div>

                <div className="panel-card-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end', background: 'var(--bg-card)' }}>
                  <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Organization Governance (Admin only) */}
          {activeTab === 'organization' && isCompanyAdmin && (
            <form onSubmit={handleSaveProfile}>
              <div className="crm-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Organization Governance & Localization</h3>
                    <p className="panel-card-subtitle">Global configurations applied across all company workspaces</p>
                  </div>
                  <span className="status-pill status-active font-mono text-xs">
                    Admin Privileges
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div className="sa-form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Company Legal Name *</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="Acme Enterprises Ltd."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Workspace Subdomain / Domain</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={companyDomain}
                        disabled
                        style={{ opacity: 0.75, cursor: 'not-allowed' }}
                      />
                      <span className="font-mono text-xs text-muted" style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                        Unique multi-tenant identifier configured during setup
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Transaction Currency</label>
                      <select
                        className="form-input font-mono"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="SGD">SGD - Singapore Dollar (S$)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Business Timezone</label>
                      <select
                        className="form-input font-mono"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                        <option value="UTC">UTC (Universal Time Coordinated)</option>
                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Automated Inbound Lead Routing Method</label>
                      <select
                        className="form-input font-mono"
                        value={leadRouting}
                        onChange={(e) => setLeadRouting(e.target.value)}
                      >
                        <option value="Round Robin">Round Robin (Distribute evenly among active reps)</option>
                        <option value="Manual Assignment">Manual Assignment (Manager allocates directly)</option>
                        <option value="Capacity Based">Capacity Based (Route to rep with lowest active deal load)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="panel-card-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end', background: 'var(--bg-card)' }}>
                  <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Organization Settings'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="crm-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Authentication & Security Settings</h3>
                  <p className="panel-card-subtitle">Rotate passwords and manage account access protections</p>
                </div>
              </div>

              {pwdFeedback && (
                <div className="auth-alert alert-success font-mono m-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{pwdFeedback}</span>
                </div>
              )}

              {pwdError && (
                <div className="auth-alert alert-error font-mono m-4">
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div style={{ padding: '24px' }}>
                  <div className="sa-form-grid-2">
                    <div className="form-group" style={{ gridColumn: '1 / -1', maxWidth: '480px' }}>
                      <label className="form-label">Current Authentication Password *</label>
                      <input
                        type="password"
                        className="form-input font-mono"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ maxWidth: '480px' }}>
                      <label className="form-label">New Password *</label>
                      <input
                        type="password"
                        className="form-input font-mono"
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ maxWidth: '480px' }}>
                      <label className="form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        className="form-input font-mono"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="panel-card-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end', background: 'var(--bg-card)' }}>
                  <button type="submit" className="btn btn-primary font-mono btn-sm">
                    Update Security Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </CompanyLayout>
  );
}
