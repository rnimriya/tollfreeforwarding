import { Download, Calendar, Mail, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PressKitPage() {
  const brandAssets = [
    { name: 'Primary Logo Pack', desc: 'Vector SVG & high-res PNG formats for dark/light layouts.', size: '4.8 MB' },
    { name: 'Executive Headshots', desc: 'Helen Carter & Aleksei Volkov corporate portraits.', size: '12.4 MB' },
    { name: 'Product Interface Previews', desc: 'Screenshots of Visual IVR Builder & Dashboard.', size: '8.2 MB' }
  ];

  const pressReleases = [
    {
      date: 'May 10, 2026',
      title: 'CloudPBX Launches Global Low-Latency SIP Platform Expansion',
      desc: 'Redundant media switches deployed in 12 regions to deliver call resolution under 50 milliseconds.'
    },
    {
      date: 'Feb 14, 2026',
      title: 'Acme Cloud Telephony Secures Series A Investment',
      desc: 'Capital expansion to double infrastructure capacity and release next-gen developer APIs.'
    }
  ];

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Media Room</span>
          <h2>Brand Identity & Press Kit</h2>
          <p>Download authorized assets, view recent announcements, and access corporate statistics overview.</p>
        </div>

        {/* Assets Download Box */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '4rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Brand Asset Packages</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {brandAssets.map((asset, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--lp-bg)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} style={{ color: 'var(--lp-accent)' }} />
                    {asset.name}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--lp-secondary)', lineHeight: 1.5, marginTop: '0.4rem' }}>
                    {asset.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--lp-border)', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--lp-muted)', fontFamily: 'monospace' }}>{asset.size}</span>
                  <button
                    onClick={() => alert(`Downloading mock package: ${asset.name}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    <Download size={12} /> Download ZIP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Profile Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3rem',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Press list */}
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Press Releases</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {pressReleases.map((pr, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--lp-secondary)', marginBottom: '0.4rem' }}>
                    <Calendar size={12} />
                    <span>{pr.date}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--lp-text)' }}>{pr.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                    {pr.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats card */}
          <div
            style={{
              background: 'var(--lp-surface)',
              border: '1px solid var(--lp-border)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Acme Corporate Facts</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Founded Year', val: '2021' },
                { label: 'Corporate Headquarter', val: 'San Francisco, CA (Remote)' },
                { label: 'Active Call Volume', val: '2.4 Million monthly' },
                { label: 'Core Platform Focus', val: 'Virtual Line Routing Telemetry' }
              ].map((fact, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--lp-muted)', fontWeight: 600 }}>{fact.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--lp-secondary)', marginTop: '0.1rem' }}>{fact.val}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: 'var(--lp-bg)',
                border: '1px solid var(--lp-border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Mail size={16} style={{ color: 'var(--lp-accent)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Press Contact</div>
                <a href="mailto:press@cloudpbx.com" style={{ fontSize: '0.8rem', color: 'var(--lp-accent)', fontWeight: 700 }}>
                  press@cloudpbx.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Usage guidelines */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '2.5rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
          }}
        >
          <ShieldCheck size={24} style={{ color: 'var(--lp-accent)', flexShrink: 0, marginTop: '3px' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Media Asset Protection Guidelines</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.6, marginTop: '0.35rem' }}>
              Our logos and assets are protected assets. When referencing CloudPBX, do not modify logo proportions, overlay custom gradients, or substitute fonts. If you require help with customized asset resolutions, contact press relations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
