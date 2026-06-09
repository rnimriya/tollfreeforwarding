import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, BarChart3, ScrollText, RefreshCw, Edit2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  role: string;
  createdAt: string;
  minutesUsedThisPeriod: number;
  _count: { virtualNumbers: number; callLogs: number };
}

interface Stats {
  totalUsers: number;
  totalNumbers: number;
  totalCalls: number;
  totalSms: number;
  planBreakdown: { plan: string; count: number }[];
  recentUsers: AdminUser[];
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string | null;
  createdAt: string;
  user: { email: string; firstName: string; lastName: string };
}

type Tab = 'users' | 'stats' | 'audit';

const PLAN_OPTIONS = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
const ROLE_OPTIONS = ['user', 'admin'];

export default function AdminPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', role: '' });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ total: number; data: AdminUser[] }>({
    queryKey: ['admin-users', search],
    queryFn: () => api.get(`/admin/users?search=${encodeURIComponent(search)}`).then((r) => r.data),
    enabled: tab === 'users',
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    enabled: tab === 'stats',
  });

  const { data: auditData } = useQuery<{ total: number; data: AuditLog[] }>({
    queryKey: ['admin-audit'],
    queryFn: () => api.get('/admin/audit').then((r) => r.data),
    enabled: tab === 'audit',
  });

  const updateUserMutation = useMutation({
    mutationFn: () => api.patch(`/admin/users/${editUser!.id}`, editForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
      toast.success('User updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to update user'),
  });

  const resetMinutesMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/reset-minutes`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Minutes reset');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to reset minutes'),
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Platform management and oversight</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {([['users', Users, 'Users'], ['stats', BarChart3, 'Platform Stats'], ['audit', ScrollText, 'Audit Log']] as const).map(([id, Icon, label]) => (
          <button key={id} className={`btn ${tab === id ? 'btn-primary' : 'btn-ghost'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setTab(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <input className="input" placeholder="Search by email or name…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
          {usersLoading ? (
            <div className="loading-page" style={{ height: 300 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    {['Email', 'Name', 'Plan', 'Role', 'Numbers', 'Calls', 'Minutes', 'Joined', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.data || []).map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-accent">{u.plan}</span></td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-muted'}`}>{u.role}</span></td>
                      <td style={{ padding: '0.75rem 1rem' }}>{u._count.virtualNumbers}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{u._count.callLogs}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{u.minutesUsedThisPeriod}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditUser(u); setEditForm({ plan: u.plan, role: u.role }); }}>
                            <Edit2 size={12} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Reset Minutes" onClick={() => { if (confirm('Reset this user\'s minute counter?')) resetMinutesMutation.mutate(u.id); }}>
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersData?.total === 0 && (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <Users size={32} />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && stats && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Active Numbers', value: stats.totalNumbers },
              { label: 'Total Calls', value: stats.totalCalls },
              { label: 'Total SMS', value: stats.totalSms },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Plan Distribution</h3>
              {stats.planBreakdown.map((p) => (
                <div key={p.plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="badge badge-accent">{p.plan}</span>
                  <span style={{ fontWeight: 700 }}>{p.count} users</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Recent Signups</h3>
              {stats.recentUsers.slice(0, 8).map((u) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{u.email}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', flexShrink: 0 }}>{format(new Date(u.createdAt), 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Time', 'User', 'Action', 'Entity', 'Entity ID'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(auditData?.data || []).map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{format(new Date(log.createdAt), 'MMM d HH:mm')}</td>
                  <td style={{ padding: '0.6rem 1rem' }}>{log.user.email}</td>
                  <td style={{ padding: '0.6rem 1rem' }}><span className="badge badge-info">{log.action}</span></td>
                  <td style={{ padding: '0.6rem 1rem' }}>{log.entityType}</td>
                  <td style={{ padding: '0.6rem 1rem', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.entityId.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!auditData?.data?.length && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <ScrollText size={32} />
              <p>No audit logs yet</p>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User: {editUser.email}</h2>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <div className="form-group">
              <label>Plan</label>
              <select className="input" value={editForm.plan} onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}>
                {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="input" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => updateUserMutation.mutate()} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
