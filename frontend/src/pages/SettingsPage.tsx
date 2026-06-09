import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Key, Trash2, Plus, Copy } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  createdAt: string;
}

type Tab = 'profile' | 'password' | 'api-keys';

export default function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('profile');
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/auth/api-keys').then((r) => r.data),
  });

  const profileMutation = useMutation({
    mutationFn: () => api.patch('/auth/profile', profile),
    onSuccess: (res) => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.patch('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    onSuccess: () => {
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to change password'),
  });

  const createKeyMutation = useMutation({
    mutationFn: () => api.post('/auth/api-keys', { name: newKeyName || 'My API Key' }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setRevealedKey(res.data.key);
      setNewKeyName('');
      toast.success('API key created — copy it now, it won\'t be shown again');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create API key'),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/api-keys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to delete key'),
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account, security, and API access</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {([['profile', User, 'Profile'], ['password', Lock, 'Password'], ['api-keys', Key, 'API Keys']] as const).map(([id, Icon, label]) => (
          <button
            key={id}
            className={`btn ${tab === id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Profile Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input className="input" value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="input" value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="input" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Plan</label>
            <input className="input" value={user?.plan || 'STARTER'} disabled style={{ opacity: 0.6 }} />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
          >
            {profileMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="card" style={{ maxWidth: 420 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input className="input" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input className="input" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input className="input" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
          <button
            className="btn btn-primary"
            disabled={passwordMutation.isPending || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirm}
            onClick={() => passwordMutation.mutate()}
          >
            {passwordMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Update Password'}
          </button>
          {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Passwords do not match</p>
          )}
        </div>
      )}

      {/* API Keys Tab */}
      {tab === 'api-keys' && (
        <div>
          {revealedKey && (
            <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'var(--success)', background: 'rgba(34,197,94,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Your new API key</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Copy this now — it will never be shown again.</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setRevealedKey(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <code style={{ flex: 1, background: 'var(--bg-elevated)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {revealedKey}
                </code>
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(revealedKey); toast.success('Copied!'); }}>
                  <Copy size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: '1.25rem', maxWidth: 480 }}>
            <h3 style={{ marginBottom: '1rem' }}>Create API Key</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                className="input"
                placeholder="Key name (e.g. My Integration)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={() => createKeyMutation.mutate()}
                disabled={createKeyMutation.isPending}
              >
                <Plus size={15} /> Create
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Active API Keys</h3>
            {keysLoading ? (
              <div className="loading-page" style={{ height: 100 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
            ) : apiKeys.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Key size={32} />
                <p>No API keys yet. Create one to integrate with external services.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {apiKeys.map((k) => (
                  <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <Key size={16} color="var(--accent)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{k.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {k.prefix}... {k.lastUsed ? `· Last used ${new Date(k.lastUsed).toLocaleDateString()}` : '· Never used'}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { if (confirm('Delete this API key?')) deleteKeyMutation.mutate(k.id); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
