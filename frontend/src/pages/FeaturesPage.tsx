import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Workflow, Clock, Zap, BarChart2, Shield,
  Search, Check, Play, Settings, Bell, Database, Mail
} from 'lucide-react';

interface FeatureItem {
  icon: React.ComponentType<any>;
  title: string;
  category: 'routing' | 'security' | 'integration';
  desc: string;
  detailedDesc: string;
  badge?: string;
}

const featuresList: FeatureItem[] = [
  {
    icon: Globe,
    title: 'Global Virtual Numbers',
    category: 'routing',
    desc: 'Instantly claim local, national, and toll-free numbers across 60+ countries.',
    detailedDesc: 'Provision high-quality lines instantly from our global inventory. Re-route your calls instantly to any landline, mobile device, or SIP trunk with zero service delay.',
    badge: 'Popular'
  },
  {
    icon: Workflow,
    title: 'Visual Menu Builder (IVR)',
    category: 'routing',
    desc: 'Drag-and-drop builder to construct customized call routing menus.',
    detailedDesc: 'Build complex interactive voice response trees without coding. Guide callers through customized departments, audio announcements, and voicemail flows in seconds.',
  },
  {
    icon: Clock,
    title: 'Time-Based Routing Rules',
    category: 'routing',
    desc: 'Direct calls based on operating hours, holiday calendars, or time zones.',
    detailedDesc: 'Configure scheduling schedules that match your business hours. Safely forward off-hour callers to voice mail boxes or overseas support shifts to maintain 24/7 availability.',
  },
  {
    icon: Zap,
    title: 'Ultra-Low Latency Routing',
    category: 'routing',
    desc: 'Inbound calls connect globally within 50 milliseconds.',
    detailedDesc: 'Our carrier network performs route resolution at lightspeed. Enjoy crystal clear call audio with zero delay, echoes, or packet drops.',
    badge: 'Premium'
  },
  {
    icon: BarChart2,
    title: 'Real-time Analytics & CDR',
    category: 'integration',
    desc: 'Monitor call counts, wait times, durations, and logs instantly.',
    detailedDesc: 'Unlock detailed insights. Filter call logs by duration, location, agent groups, or costs, and export formatted CSV reports for audit compliance.',
  },
  {
    icon: Shield,
    title: 'Military-Grade Call Encryption',
    category: 'security',
    desc: 'Secure SIP trunks, encrypted call recordings, and access logs.',
    detailedDesc: 'Keep user and caller metadata private. All call logs, settings, and recordings are encrypted at rest and in transit using industry-standard AES-256 standards.',
  },
  {
    icon: Settings,
    title: 'API Integration Console',
    category: 'integration',
    desc: 'Configure APIs to programmatically control routing configurations.',
    detailedDesc: 'Automate number purchasing, retrieve call statistics, build custom routing endpoints, and synchronise calls with CRM platforms seamlessly.',
  },
  {
    icon: Bell,
    title: 'Webhook Subscriptions',
    category: 'integration',
    desc: 'Get real-time HTTP alerts for call events as they happen.',
    detailedDesc: 'Receive instant callback updates when calls start, connect, disconnect, or generate a voice recording, enabling prompt custom notifications.',
  },
  {
    icon: Database,
    title: 'Custom SIP Trunking',
    category: 'security',
    desc: 'Connect virtual numbers directly to local IP-PBX systems.',
    detailedDesc: 'Map global virtual numbers directly to existing corporate SIP setups. Perfect for business centers wanting to maintain local hardware servers.',
  },
];

export default function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'routing' | 'security' | 'integration'>('all');

  const filteredFeatures = featuresList.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">
        
        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Platform Overview</span>
          <h2>Enterprise PBX Features, Reimagined</h2>
          <p>Explore our suite of routing, telemetry, and integration solutions engineered to run your global call infrastructure.</p>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Features' },
              { id: 'routing', label: 'Call Routing' },
              { id: 'security', label: 'Security & PBX' },
              { id: 'integration', label: 'Integrations & API' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  background: selectedCategory === tab.id ? 'var(--lp-accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedCategory === tab.id ? '#fff' : 'var(--lp-secondary)',
                  border: `1px solid ${selectedCategory === tab.id ? 'var(--lp-accent)' : 'var(--lp-border)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--lp-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                paddingLeft: '38px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
              }}
            />
          </div>
        </div>

        {/* Features Grid */}
        {filteredFeatures.length > 0 ? (
          <div className="lp-features-grid" style={{ marginBottom: '5rem' }}>
            {filteredFeatures.map((f, i) => {
              const IconComp = f.icon;
              return (
                <div
                  key={i}
                  className="lp-feature-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        className="lp-feature-icon"
                        style={{
                          background: 'rgba(99,102,241,0.1)',
                          color: 'var(--lp-accent)',
                          marginBottom: 0,
                        }}
                      >
                        <IconComp size={22} />
                      </div>
                      {f.badge && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: f.badge === 'Premium' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                            color: f.badge === 'Premium' ? 'var(--lp-warning)' : 'var(--lp-success)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '99px',
                            border: `1px solid ${f.badge === 'Premium' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`,
                          }}
                        >
                          {f.badge}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {f.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid var(--lp-border)',
                      paddingTop: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--lp-muted)',
                      lineHeight: '1.5',
                    }}
                  >
                    {f.detailedDesc}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--lp-muted)' }}>
            <p>No features found matching "{searchQuery}". Try a different term!</p>
          </div>
        )}

        {/* Feature Matrix Comparison Table */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '5rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Compare Platform Capability Plan Tiers</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)' }}>Find which level fits your operational model.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ background: 'transparent', padding: '1rem', color: 'var(--lp-text)', fontWeight: 700 }}>Features</th>
                  <th style={{ background: 'transparent', padding: '1rem', textAlign: 'center', color: 'var(--lp-text)', fontWeight: 700 }}>Starter</th>
                  <th style={{ background: 'transparent', padding: '1rem', textAlign: 'center', color: 'var(--lp-text)', fontWeight: 700 }}>Professional</th>
                  <th style={{ background: 'transparent', padding: '1rem', textAlign: 'center', color: 'var(--lp-text)', fontWeight: 700 }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Virtual Phone Numbers', s: '1 Line', p: '5 Lines', e: 'Unlimited' },
                  { name: 'Monthly Call Minutes Included', s: '500 Minutes', p: '2,000 Minutes', e: 'Unlimited (Fair Use)' },
                  { name: 'Interactive Voice Menus (IVR)', s: 'Standard IVR', p: 'Visual Builder IVR', e: 'Unlimited + Custom logic' },
                  { name: 'Call Recording & Telemetry', s: '—', p: 'Included (30 days)', e: 'Unlimited + Archival export' },
                  { name: 'Webhook Notifications', s: '—', p: 'Included', e: 'Priority queueing' },
                  { name: 'Developer APIs access', s: '—', p: 'Standard rate-limits', e: 'Custom endpoints & high-limits' },
                  { name: 'Support Channels Available', s: 'Email support', p: 'Priority email & chat', e: 'Dedicated account lead 24/7' },
                  { name: 'Uptime SLA Guarantee', s: 'Best effort', p: '99.9% guarantee', e: '99.99% contract SLA' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--lp-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{row.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--lp-secondary)' }}>{row.s}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--lp-secondary)', fontWeight: 600 }}>{row.p}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--lp-accent)', fontWeight: 700 }}>{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call-to-action Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '24px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.75rem' }}>Ready to optimize your phone routing?</h3>
            <p style={{ fontSize: '1rem', color: 'var(--lp-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Create an account in minutes. Get your first business virtual number instantly, and build a beautiful greeting IVR right away.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="lp-btn-hero-primary">Start 14-day Free Trial</Link>
              <Link to="/pricing" className="lp-btn-hero-ghost">View Pricing Plans</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
