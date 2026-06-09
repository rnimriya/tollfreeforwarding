import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, Zap, Phone, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  numbers: number;
  minutes: number;
  features: string[];
}

interface Usage {
  plan: string;
  minutesUsed: number;
  minuteLimit: number | null;
  minutesLeft: number | null;
  numberCount: number;
  trialEndsAt: string | null;
  billingPeriodStart: string | null;
  stripeSubscriptionId: string | null;
}

interface PlansResponse {
  plans: Plan[];
  stripeEnabled: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  STARTER: 'var(--accent)',
  PROFESSIONAL: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
};

export default function BillingPage() {
  const { data: plansData } = useQuery<PlansResponse>({
    queryKey: ['billing-plans'],
    queryFn: () => api.get('/billing/plans').then((r) => r.data),
  });

  const { data: usage } = useQuery<Usage>({
    queryKey: ['billing-usage'],
    queryFn: () => api.get('/billing/usage').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => api.post('/billing/checkout', { plan }),
    onSuccess: (res) => {
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.success(res.data.message || 'Plan updated');
        window.location.reload();
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to start checkout'),
  });

  const portalMutation = useMutation({
    mutationFn: () => api.post('/billing/portal'),
    onSuccess: (res) => {
      if (res.data.url) window.location.href = res.data.url;
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to open billing portal'),
  });

  const currentPlan = usage?.plan || 'STARTER';
  const minutePct = usage?.minuteLimit ? Math.min(100, Math.round((usage.minutesUsed / usage.minuteLimit) * 100)) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Plans</h1>
          <p className="page-subtitle">Manage your subscription and monitor usage</p>
        </div>
        {usage?.stripeSubscriptionId && (
          <button className="btn btn-secondary" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
            <ExternalLink size={15} /> Manage Subscription
          </button>
        )}
      </div>

      {/* Usage Summary */}
      {usage && (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)' }}>
                <Zap size={18} color="var(--accent)" />
              </div>
              <span className="badge badge-accent" style={{ background: PLAN_COLORS[currentPlan] + '22', color: PLAN_COLORS[currentPlan] }}>
                {currentPlan}
              </span>
            </div>
            <div className="stat-value">{usage.minutesUsed}</div>
            <div className="stat-label">Minutes Used This Period</div>
            {usage.minuteLimit && (
              <>
                <div style={{ marginTop: '0.75rem', height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${minutePct}%`, height: '100%', background: minutePct > 90 ? 'var(--danger)' : minutePct > 70 ? 'var(--warning)' : 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {usage.minutesLeft} of {usage.minuteLimit} minutes remaining
                </div>
              </>
            )}
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(34,197,94,0.12)', borderRadius: 'var(--radius-md)' }}>
                <Phone size={18} color="var(--success)" />
              </div>
            </div>
            <div className="stat-value">{usage.numberCount}</div>
            <div className="stat-label">Active Virtual Numbers</div>
          </div>

          {usage.billingPeriodStart && (
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.12)', borderRadius: 'var(--radius-md)' }}>
                  <Clock size={18} color="var(--warning)" />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{new Date(usage.billingPeriodStart).toLocaleDateString()}</div>
              <div className="stat-label">Current Period Start</div>
            </div>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <h2 style={{ marginBottom: '1rem' }}>Available Plans</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {(plansData?.plans || []).map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const color = PLAN_COLORS[plan.id] || 'var(--accent)';
          return (
            <div
              key={plan.id}
              className="card"
              style={{
                border: isCurrent ? `2px solid ${color}` : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {isCurrent && (
                <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 20, textTransform: 'uppercase' }}>
                  Current
                </span>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ color }}>{plan.name}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                  ${plan.monthlyPrice}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${plan.annualPrice}/mo billed annually</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <CheckCircle size={14} color={color} style={{ flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              {!isCurrent && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', background: color, borderColor: color }}
                  onClick={() => checkoutMutation.mutate(plan.id)}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
