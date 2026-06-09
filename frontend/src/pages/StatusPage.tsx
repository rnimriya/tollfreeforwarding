import { CheckCircle, AlertTriangle, ShieldCheck, Clock, Server, ArrowRight } from 'lucide-react';

export default function StatusPage() {
  const components = [
    { name: 'Developer APIs Gateway', status: 'operational', uptime: '99.98%', desc: 'REST endpoint resolution switches.' },
    { name: 'Webhook Attendant Router', status: 'operational', uptime: '99.95%', desc: 'Call events callback payload triggers.' },
    { name: 'Carrier SIP Trunks', status: 'operational', uptime: '99.99%', desc: 'Inbound carrier line switches.' },
    { name: 'Dashboard Console Client', status: 'operational', uptime: '99.92%', desc: 'User UI settings configuration page.' }
  ];

  const historicalIncidents = [
    {
      date: 'June 03, 2026',
      title: 'Carrier Porting Database Resolution Delay',
      status: 'Resolved',
      duration: '42 mins',
      desc: 'Our carrier routing provider experienced latency syncing ported virtual lines. Lines remained active but changes were throttled. Resolved via secondary trunk sync.'
    },
    {
      date: 'May 14, 2026',
      title: 'Scheduled Node Software Migration',
      status: 'Completed',
      duration: '2 hours (Window)',
      desc: 'Routine database migrations to upgrade REST endpoint API speeds. No downtime experienced by subscribers.'
    }
  ];

  // 30 days grid timeline simulation
  const simulateTimeline = () => {
    return Array.from({ length: 30 }).map((_, idx) => {
      // simulate 1 minor hiccup on day 12
      if (idx === 11) return 'warning';
      return 'success';
    });
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Large overall status banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.06))',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            marginBottom: '4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--lp-success)', padding: '0.85rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--lp-text)' }}>All Systems Operational</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--lp-secondary)', maxWidth: '560px' }}>
            CloudPBX routes calls, handles IVR trees, and fires webhook notifications with zero service interruptions.
          </p>
        </div>

        {/* Component Monitors */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '4rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Component Uptime (Last 30 Days)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {components.map((comp, idx) => (
              <div key={idx} style={{ borderBottom: idx < components.length - 1 ? '1px solid var(--lp-border)' : 'none', paddingBottom: '1.5rem' }}>
                
                {/* Info row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--lp-text)' }}>{comp.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--lp-secondary)', marginTop: '0.1rem' }}>{comp.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--lp-success)' }}>{comp.uptime}</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(34,197,94,0.12)', color: 'var(--lp-success)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
                      {comp.status}
                    </span>
                  </div>
                </div>

                {/* Timeline bars */}
                <div style={{ display: 'flex', gap: '4px', height: '14px', alignItems: 'center' }}>
                  {simulateTimeline().map((state, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '2px',
                        background: state === 'success' ? 'var(--lp-success)' : 'var(--lp-warning)',
                        opacity: 0.85,
                      }}
                      title={`Day ${sIdx + 1}: ${state === 'success' ? '100% operational' : 'Minor issue resolved'}`}
                    />
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--lp-muted)', marginTop: '0.35rem' }}>
                  <span>30 days ago</span>
                  <span>Average: {comp.uptime}</span>
                  <span>Today</span>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Incidents Feed */}
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Historical Incidents</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {historicalIncidents.map((inc, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--lp-surface)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--lp-secondary)', fontWeight: 600 }}>{inc.date}</span>
                  <span style={{ fontSize: '0.72rem', background: 'var(--lp-accent-dim)', color: 'var(--lp-accent)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
                    {inc.status} ({inc.duration})
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--lp-text)' }}>{inc.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5, marginTop: '0.5rem' }}>
                  {inc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
