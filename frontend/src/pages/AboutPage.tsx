import { Globe, Shield, Users, Heart, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Globe, title: 'Global Availability', desc: 'Connecting virtual trunks across boundaries with minimal latency connections.' },
    { icon: Shield, title: 'Absolute Integrity', desc: 'Securing call databases and user data metadata with AES-256 standard encryption models.' },
    { icon: Users, title: 'Customer First', desc: 'Creating interfaces built for developers, support centers, and business agents alike.' },
    { icon: Heart, title: 'Passionate Quality', desc: 'Maintaining carrier paths with redundancies to ensure clear audio packets.' }
  ];

  const timeline = [
    { year: '2021', title: 'Foundation & Seed Phase', desc: 'CloudPBX started with a core routing switch and provisioned numbers in 5 countries.' },
    { year: '2023', title: 'Series A Funding & IVR Release', desc: 'Introduced the drag-and-drop Visual IVR Builder, expanding routing to 30 countries.' },
    { year: '2025', title: 'Global Carrier Integrations', desc: 'Upgraded nodes to support sub-50ms routing resolution times across 60+ countries.' }
  ];

  const team = [
    { name: 'Dr. Helen Carter', role: 'CEO & Co-Founder', bio: 'Former infrastructure lead with 15+ years experience in telecommunication switches.', avatar: 'HC' },
    { name: 'Aleksei Volkov', role: 'CTO & Co-Founder', bio: 'Pioneered low-latency media routing algorithms and custom SIP trunk integrations.', avatar: 'AV' },
    { name: 'Sarah Jenkins', role: 'VP of Customer Success', bio: 'Dedicated to providing top support response SLAs and building global guides.', avatar: 'SJ' }
  ];

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Hero Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Our Journey</span>
          <h2>Telecommunications Built for the Modern Cloud</h2>
          <p>We are a distributed team of engineers and support professionals building low-latency calling infrastructures.</p>
        </div>

        {/* Grid Stats about POPs */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            marginBottom: '4rem',
            boxShadow: 'var(--lp-shadow-card)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
          className="lp-spotlight-inner"
        >
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Global Carrier Backbone Infrastructure</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              We manage media switching routing servers in 12 global regions. Our redundant routing configurations guarantee that packet transfers occur with minimal hops and carrier-grade protection.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { count: '12+', label: 'Global Server Regions' },
                { count: '60+', label: 'Countries Provisioned' },
                { count: '12K+', label: 'Active Business Accounts' },
                { count: '99.99%', label: 'Switch Uptime SLA' }
              ].map((m, idx) => (
                <div key={idx} style={{ background: 'var(--lp-bg)', border: '1px solid var(--lp-border)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lp-accent)' }}>{m.count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lp-secondary)', marginTop: '0.2rem' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--lp-bg)',
              border: '1px solid var(--lp-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--lp-accent)' }}>
              <Award size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Our Vision</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>
              "To remove traditional pricing overheads and technical friction surrounding enterprise telephony, giving developers and support networks direct programmatic access to international numbers and intelligent routing tools."
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Values We Stand By</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {values.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <div key={idx} className="lp-feature-card">
                  <div className="lp-feature-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--lp-accent)', marginBottom: '1rem' }}>
                    <IconComp size={20} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{v.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones timeline */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '4rem',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Company Timeline & Milestones</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {timeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    background: 'var(--lp-accent-dim)',
                    color: 'var(--lp-accent)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}
                >
                  {item.year}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Leadership Team</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {team.map((member, idx) => (
              <div
                key={idx}
                className="lp-feature-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  padding: '2rem 1.5rem',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--lp-accent), var(--lp-accent2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    flexShrink: 0,
                  }}
                >
                  {member.avatar}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{member.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lp-accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {member.role}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
