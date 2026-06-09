import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Phone, Plus, ChevronRight, Globe, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface VirtualNumber {
  id: string;
  e164Number: string;
  friendlyName: string;
  numberType: string;
  status: string;
  timezone: string;
  countryCode: string;
  _count?: { callLogs: number; routingRules: number };
}

const TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Phoenix','America/Anchorage','America/Honolulu','Europe/London',
  'Europe/Paris','Europe/Berlin','Asia/Tokyo','Asia/Singapore','Australia/Sydney',
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success', SUSPENDED: 'warning', PENDING: 'info', RELEASED: 'muted',
};

export default function NumbersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ friendlyName: '', numberType: 'LOCAL', timezone: 'America/New_York' });

  const { data, isLoading } = useQuery<{ total: number; data: VirtualNumber[] }>({
    queryKey: ['numbers'],
    queryFn: () => api.get('/numbers').then((r) => r.data),
  });

  const numbers = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => api.post('/numbers', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['numbers'] });
      setShowModal(false);
      toast.success('Virtual number provisioned!');
      setForm({ friendlyName: '', numberType: 'LOCAL', timezone: 'America/New_York' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create number'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/numbers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['numbers'] });
      toast.success('Number released');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to release number'),
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Virtual Numbers</h1>
          <p className="page-subtitle">
            {data ? `${data.total} number${data.total !== 1 ? 's' : ''}` : 'Manage your phone numbers, routing rules, and IVR flows'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Provision Number
        </button>
      </div>

      {isLoading ? (
        <div className="loading-page" style={{ height: 300 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : numbers.length === 0 ? (
        <div className="empty-state">
          <Phone size={48} />
          <h3>No virtual numbers yet</h3>
          <p>Provision your first virtual number to start routing calls.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            <Plus size={15} /> Provision Number
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {numbers.map((num) => (
            <div key={num.id} className="number-card" onClick={() => navigate(`/numbers/${num.id}`)}>
              <div className="number-card-icon">
                <Phone size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span className="number-e164">{num.e164Number}</span>
                  <span className={`badge badge-${STATUS_COLOR[num.status] ?? 'muted'}`}>{num.status}</span>
                  <span className="badge badge-muted">{num.numberType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{num.friendlyName}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={11} /> {num.timezone}
                  </span>
                  {num._count && (
                    <>
                      <span>{num._count.routingRules} rules</span>
                      <span>{num._count.callLogs} calls</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Release this number? This cannot be undone.')) deleteMutation.mutate(num.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Provision Virtual Number</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Friendly Name</label>
              <input
                className="input"
                placeholder="e.g. Sales Line"
                value={form.friendlyName}
                onChange={(e) => setForm((f) => ({ ...f, friendlyName: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number Type</label>
                <select className="input" value={form.numberType} onChange={(e) => setForm((f) => ({ ...f, numberType: e.target.value }))}>
                  <option value="LOCAL">Local</option>
                  <option value="TOLL_FREE">Toll-Free</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select className="input" value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Provision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
