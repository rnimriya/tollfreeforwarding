import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart2, Calendar, PhoneCall, Clock,
  Users, DollarSign, Download, ArrowRight, RefreshCw
} from 'lucide-react';

export default function AnalyticsMarketingPage() {
  const [dateRange, setDateRange] = useState<'today' | 'seven_days' | 'thirty_days'>('seven_days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic values depending on selected dates
  const statsMap = {
    today: {
      volume: 412,
      answered: 384,
      missed: 28,
      avgWait: '14s',
      duration: '3m 12s',
      cost: 18.50,
      chartHeights: [20, 35, 45, 30, 60, 75, 90, 85, 70, 50, 40, 25]
    },
    seven_days: {
      volume: 3284,
      answered: 3098,
      missed: 186,
      avgWait: '18s',
      duration: '4m 02s',
      cost: 147.80,
      chartHeights: [45, 60, 55, 70, 85, 95, 80, 75, 90, 88, 70, 65]
    },
    thirty_days: {
      volume: 14890,
      answered: 13950,
      missed: 940,
      avgWait: '19s',
      duration: '3m 52s',
      cost: 670.25,
      chartHeights: [60, 70, 80, 75, 90, 95, 88, 82, 91, 98, 85, 80]
    }
  };

  const activeStats = statsMap[dateRange];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Real-time Telemetry</span>
          <h2>Measure What Matters, Live</h2>
          <p>Gain absolute clarity on call volumes, queues response times, and billing expenses with our detailed tracking dashboard.</p>
        </div>

        {/* Dashboard Frame Mockup */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: 'var(--lp-shadow-card)',
            marginBottom: '4rem',
          }}
        >
          {/* Dashboard Header toolbar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--lp-border)',
              paddingBottom: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Inbound Calls Analytics Overview</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--lp-secondary)', marginTop: '0.2rem' }}>
                Operational dashboard for virtual routing trunks.
              </p>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--lp-bg)', border: '1px solid var(--lp-border)', borderRadius: '10px', padding: '0.25rem' }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'seven_days', label: 'Last 7 Days' },
                  { id: 'thirty_days', label: 'Last 30 Days' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id as any)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: dateRange === range.id ? 'var(--lp-accent)' : 'transparent',
                      color: dateRange === range.id ? '#fff' : 'var(--lp-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Refresh trigger */}
              <button
                onClick={handleRefresh}
                style={{
                  background: 'var(--lp-bg)',
                  border: '1px solid var(--lp-border)',
                  color: 'var(--lp-secondary)',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Refresh Data"
              >
                <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
              </button>
              
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {[
              { label: 'Total Inbound Call Vol', value: activeStats.volume.toLocaleString(), sub: 'Calls received', icon: PhoneCall, color: '#6366f1' },
              { label: 'Answered Connections', value: activeStats.answered.toLocaleString(), sub: `${Math.round((activeStats.answered / activeStats.volume) * 100)}% Connect Rate`, icon: Users, color: '#22c55e' },
              { label: 'Average Queue Hold', value: activeStats.avgWait, sub: 'Target: < 20 seconds', icon: Clock, color: '#f59e0b' },
              { label: 'Total Spent Capital', value: `$${activeStats.cost.toLocaleString()}`, sub: 'Trunk + Minute usage', icon: DollarSign, color: '#38bdf8' },
            ].map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--lp-elevated)',
                    border: '1px solid var(--lp-border)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--lp-secondary)' }}>{stat.label}</span>
                    <IconComp size={16} style={{ color: stat.color }} />
                  </div>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--lp-text)' }}>{stat.value}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--lp-muted)', marginTop: '0.2rem', fontWeight: 500 }}>{stat.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Chart Board Graph */}
          <div
            style={{
              background: 'var(--lp-elevated)',
              border: '1px solid var(--lp-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Inbound Call Frequency Spike Index</span>
              <span style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--lp-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--lp-accent)', borderRadius: '50%' }} /> Peak Hours
                </span>
              </span>
            </div>

            {/* Custom chart simulation bar grid */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '180px',
                gap: '8px',
                padding: '0 0.5rem',
                borderBottom: '1px solid var(--lp-border)',
              }}
            >
              {activeStats.chartHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: 'linear-gradient(to top, var(--lp-accent), var(--lp-accent2))',
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.85,
                    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              ))}
            </div>
            
            {/* Chart Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--lp-muted)', marginTop: '0.5rem', padding: '0 0.5rem' }}>
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>

          {/* Footer controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--lp-muted)' }}>
              Data synced with Acme Gateway Switch • Last check: Just now
            </span>
            <button
              onClick={() => alert('Simulating Call Detail Records (CDR) CSV Export... Check downloads folder (mock)')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <Download size={14} /> Download CDR Table
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            {
              title: 'Detailed Call Detail Records (CDR)',
              desc: 'Trace calls step-by-step. See E.164 caller identifiers, duration times, dial rules fired, exact network provider latency metrics, and charge sums.',
              icon: BarChart2
            },
            {
              title: 'Hourly & Daily Load Trends',
              desc: 'Optimize support schedules easily. Track active spikes throughout corporate weeks to verify shift allocations match inbound caller needs.',
              icon: Calendar
            },
            {
              title: 'Agent Hold Time Tracking',
              desc: 'Keep performance standards high. Identify how long callers remain inside IVR loops or call queues before agents pick up the calls.',
              icon: Clock
            }
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--lp-accent)', marginBottom: '1rem' }}>
                  <IconComp size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Start tracking calling metrics today</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', maxWidth: '580px' }}>
              Provision your virtual numbers and get clean, beautiful charts immediately. 14-day free trial on all plans.
            </p>
          </div>
          <Link to="/register" className="lp-btn-primary">
            Get Started Free <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
