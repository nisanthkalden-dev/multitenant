import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/settingsApi';

export default function CompanySettingsPage() {
  const { user, role } = useAuth();
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

      {error && (
        <div className="auth-alert alert-error font-mono mb-4" role="alert">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="font-mono text-center text-muted p-4">Loading settings from database...</div>
      ) : (
        <div className="crm-settings-sections">
          <form onSubmit={handleSaveProfile}>
            {/* Personal Profile Section */}
            <div className="crm-panel-card mb-6">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Personal Credentials & Contact</h3>
                  <p className="panel-card-subtitle">Your user identity stored in the database</p>
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  <span className="text-xs text-muted font-mono mt-1">Role tier managed by workspace administrator</span>
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
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="sa-form-footer mb-6">
              <button type="submit" className="btn btn-primary font-mono" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>

          {/* Password Change Form */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Change Password</h3>
                <p className="panel-card-subtitle">Update your authentication password</p>
              </div>
            </div>

            {pwdFeedback && (
              <div className="auth-alert alert-success font-mono m-4">
                <span>{pwdFeedback}</span>
              </div>
            )}

            {pwdError && (
              <div className="auth-alert alert-error font-mono m-4">
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ padding: '20px' }}>
              <div className="sa-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sa-form-footer mt-4">
                <button type="submit" className="btn btn-primary font-mono">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
