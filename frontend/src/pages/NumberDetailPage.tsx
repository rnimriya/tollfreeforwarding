import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Edit2, Workflow, Phone, Clock, Globe } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ACTIONS = ['FORWARD_PSTN', 'FORWARD_SIP', 'RING_GROUP', 'VOICEMAIL', 'REJECT'];
const STRATEGIES = ['SEQUENTIAL', 'SIMULTANEOUS', 'ROUND_ROBIN'];

function emptyRule() {
  return {
    label: 'Business Hours',
    priority: 0,
    activeDays: [1, 2, 3, 4, 5],
    openTime: '09:00',
    closeTime: '17:00',
    action: 'FORWARD_PSTN',
    destinations: [{ type: 'PSTN', value: '', order: 1 }],
    ringStrategy: 'SEQUENTIAL',
    ringTimeout: 30,
    sipUri: '',
  };
}

export default function NumberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState(emptyRule());

  const { data: vn, isLoading } = useQuery({
    queryKey: ['number', id],
    queryFn: () => api.get(`/numbers/${id}`).then((r) => r.data),
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['routing', id],
    queryFn: () => api.get(`/routing/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editRule
        ? api.patch(`/routing/${id}/${editRule.id}`, data)
        : api.post(`/routing/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routing', id] });
      setShowRuleModal(false);
      toast.success(editRule ? 'Rule updated' : 'Rule created');
    },
    onError: () => toast.error('Failed to save rule'),
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => api.delete(`/routing/${id}/${ruleId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routing', id] });
      toast.success('Rule deleted');
    },
  });

  const openCreate = () => {
    setEditRule(null);
    setRuleForm(emptyRule());
    setShowRuleModal(true);
  };

  const openEdit = (rule: any) => {
    setEditRule(rule);
    setRuleForm({ ...rule, destinations: rule.destinations?.length ? rule.destinations : [{ type: 'PSTN', value: '', order: 1 }] });
    setShowRuleModal(true);
  };

  const toggleDay = (d: number) => {
    setRuleForm((f) => ({
      ...f,
      activeDays: f.activeDays.includes(d) ? f.activeDays.filter((x: number) => x !== d) : [...f.activeDays, d].sort(),
    }));
  };

  const actionColor = (a: string) => ({ FORWARD_PSTN: 'success', FORWARD_SIP: 'info', RING_GROUP: 'accent', VOICEMAIL: 'warning', REJECT: 'danger' }[a] || 'muted');

  if (isLoading) {
    return <div className="loading-page"><div className="spinner" style={{ width: 28, height: 28 }} /></div>;
  }

  if (!vn) return <div className="page"><p>Number not found.</p></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/numbers')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700 }}>{vn.e164Number}</span>
              <span className="badge badge-success">{vn.status}</span>
            </div>
            <p className="page-subtitle">{vn.friendlyName} · {vn.timezone} · {vn.numberType}</p>
          </div>
          <Link to={`/numbers/${id}/ivr`} className="btn btn-secondary">
            <Workflow size={15} /> Visual IVR Builder
          </Link>
        </div>
      </div>

      {/* Routing Rules */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Routing Rules</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={14} /> Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="empty-state">
          <Clock size={40} />
          <h3>No routing rules</h3>
          <p>Add rules to control how calls are routed based on time-of-day, day of week, and more.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>
            <Plus size={14} /> Add Rule
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Label</th>
                <th>Schedule</th>
                <th>Action</th>
                <th>Destination</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule: any) => (
                <tr key={rule.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>#{rule.priority}</span></td>
                  <td><strong>{rule.label}</strong></td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>{rule.activeDays.map((d: number) => DAYS[d - 1]).join(', ')}</div>
                      {rule.openTime && <div>{rule.openTime} – {rule.closeTime}</div>}
                    </div>
                  </td>
                  <td><span className={`badge badge-${actionColor(rule.action)}`}>{rule.action.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {rule.destinations?.[0]?.value || rule.sipUri || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(rule)}><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete rule?')) deleteMutation.mutate(rule.id); }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="modal-backdrop" onClick={() => setShowRuleModal(false)}>
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editRule ? 'Edit Routing Rule' : 'New Routing Rule'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowRuleModal(false)}>✕</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Label</label>
                <input className="input" value={ruleForm.label} onChange={(e) => setRuleForm((f) => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Priority (lower = first)</label>
                <input className="input" type="number" min={0} value={ruleForm.priority} onChange={(e) => setRuleForm((f) => ({ ...f, priority: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="form-group">
              <label>Active Days</label>
              <div className="day-chips">
                {DAYS.map((d, i) => (
                  <button key={d} className={`day-chip ${ruleForm.activeDays.includes(i + 1) ? 'active' : ''}`} onClick={() => toggleDay(i + 1)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Open Time (24h)</label>
                <input className="input" type="time" value={ruleForm.openTime || ''} onChange={(e) => setRuleForm((f) => ({ ...f, openTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Close Time (24h)</label>
                <input className="input" type="time" value={ruleForm.closeTime || ''} onChange={(e) => setRuleForm((f) => ({ ...f, closeTime: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Action</label>
                <select className="input" value={ruleForm.action} onChange={(e) => setRuleForm((f) => ({ ...f, action: e.target.value }))}>
                  {ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Ring Strategy</label>
                <select className="input" value={ruleForm.ringStrategy} onChange={(e) => setRuleForm((f) => ({ ...f, ringStrategy: e.target.value }))}>
                  {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {['FORWARD_PSTN', 'RING_GROUP'].includes(ruleForm.action) && (
              <div className="form-group">
                <label>Forward To (phone number)</label>
                <input
                  className="input"
                  placeholder="+15550001234"
                  value={ruleForm.destinations[0]?.value || ''}
                  onChange={(e) => setRuleForm((f) => ({ ...f, destinations: [{ type: 'PSTN', value: e.target.value, order: 1 }] }))}
                />
              </div>
            )}

            {ruleForm.action === 'FORWARD_SIP' && (
              <div className="form-group">
                <label>SIP URI</label>
                <input className="input" placeholder="sip:user@domain.com" value={ruleForm.sipUri} onChange={(e) => setRuleForm((f) => ({ ...f, sipUri: e.target.value }))} />
              </div>
            )}

            <div className="form-group">
              <label>Ring Timeout (seconds)</label>
              <input className="input" type="number" min={5} max={120} value={ruleForm.ringTimeout} onChange={(e) => setRuleForm((f) => ({ ...f, ringTimeout: Number(e.target.value) }))} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowRuleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => saveMutation.mutate(ruleForm)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
