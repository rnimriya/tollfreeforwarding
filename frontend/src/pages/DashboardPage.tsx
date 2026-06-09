import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Phone, TrendingUp, Clock, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../lib/api';
import { fmtDurationShort } from '../lib/format';
import { format, parseISO } from 'date-fns';

interface Stats {
  totalNumbers: number;
  totalCalls: number;
  monthCalls: number;
  callGrowth: number;
  avgDuration: number;
  statusBreakdown: { status: string; count: number }[];
  dailyCalls: { date: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#22c55e',
  NO_ANSWER: '#f59e0b',
  VOICEMAIL: '#6366f1',
  FAILED: '#ef4444',
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
    refetchInterval: 30_000,
  });

  // G-9: Active call indicator
  const { data: activeCallData } = useQuery<{ activeCalls: number }>({
    queryKey: ['active-calls'],
    queryFn: () => api.get('/calls/active').then((r) => r.data),
    refetchInterval: 10_000,
  });
  const activeCalls = activeCallData?.activeCalls ?? 0;

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>
      </div>
    );
  }

  const chartData = (stats?.dailyCalls || []).map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  const pieData = (stats?.statusBreakdown || []).map((s) => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] || '#64748b',
  }));

  const growthPositive = (stats?.callGrowth ?? 0) >= 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your virtual phone system</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activeCalls > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(34,197,94,0.12)', borderRadius: 20 }}>
              <span className="pulse" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>{activeCalls} active call{activeCalls !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)' }}>
              <Phone size={18} color="var(--accent)" />
            </div>
            <span className="badge badge-accent">Numbers</span>
          </div>
          <div className="stat-value">{stats?.totalNumbers ?? 0}</div>
          <div className="stat-label">Virtual Numbers</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(34,197,94,0.12)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={18} color="var(--success)" />
            </div>
            <span className="badge badge-success">This Month</span>
          </div>
          <div className="stat-value">{stats?.monthCalls ?? 0}</div>
          <div className="stat-label">Calls This Month</div>
          <div className={`stat-delta ${growthPositive ? 'positive' : 'negative'}`}>
            {growthPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(stats?.callGrowth ?? 0)}% vs last month
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(56,189,248,0.12)', borderRadius: 'var(--radius-md)' }}>
              <Clock size={18} color="var(--info)" />
            </div>
            <span className="badge badge-info">Avg</span>
          </div>
          <div className="stat-value">{fmtDurationShort(stats?.avgDuration ?? 0)}</div>
          <div className="stat-label">Avg Call Duration</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.12)', borderRadius: 'var(--radius-md)' }}>
              <TrendingUp size={18} color="var(--warning)" />
            </div>
            <span className="badge badge-warning">Total</span>
          </div>
          <div className="stat-value">{stats?.totalCalls ?? 0}</div>
          <div className="stat-label">Total Calls All-Time</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Call Volume - Last 7 Days</h3>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <Activity size={32} />
              <p>No calls yet. Use the simulator in Call Logs to generate test data.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#callGrad)" name="Calls" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Call Status Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Activity size={28} />
              <p style={{ fontSize: '0.8rem' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
