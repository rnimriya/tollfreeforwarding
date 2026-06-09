import { ShieldCheck, FileText, Download, Check, HelpCircle } from 'lucide-react';

export default function SLAPage() {
  const supportTiers = [
    { priority: 'P1 - Critical Outage', response: '< 15 Minutes', coverage: '24/7/365', channel: 'Hotline / Pager' },
    { priority: 'P2 - Degraded Service', response: '< 1 Hour', coverage: '24/7/365', channel: 'Direct Chat' },
    { priority: 'P3 - Core Features config help', response: '< 4 Hours', coverage: 'Business Hours', channel: 'Ticket Desk' },
    { priority: 'P4 - General Inquiries', response: '< 12 Hours', coverage: 'Business Hours', channel: 'Email Desk' }
  ];

  const creditTable = [
    { uptime: '≥ 99.99%', credit: '0% (Standard compliance)' },
    { uptime: '99.95% to < 99.99%', credit: '10% subscription fee credit' },
    { uptime: '99.90% to < 99.95%', credit: '25% subscription fee credit' },
    { uptime: '< 99.90%', credit: '50% subscription fee credit' }
  ];

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Carrier Standard</span>
          <h2>Service Level Agreement (SLA)</h2>
          <p>Read about our carrier-grade uptime commitments, service credit details, and response time tier guarantees.</p>
        </div>

        {/* Download Callout */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <FileText size={22} style={{ color: 'var(--lp-accent)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Formal SLA Document</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--lp-secondary)', marginTop: '0.15rem' }}>
                Download the PDF copy of our service guarantees for auditing.
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Downloading official SLA document (mock download)...')}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Download PDF Copy
          </button>
        </div>

        {/* Main SLA Content sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.7fr',
            gap: '3rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Main sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Section 1 */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
                1. Service Commitment
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7 }}>
                Acme Corp committed to providing a secure, carrier-grade virtual telephony platform. We guarantee an Monthly Uptime Percentage of at least <strong>99.99%</strong> for our media switching routing networks. In the event that this SLA target is not achieved in a billing month, you are eligible to request Service Credits as detailed below.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
                2. Uptime Calculations
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                "Monthly Uptime Percentage" is calculated by subtracting from 100% the percentage of minutes during the month in which the SIP switches or API gateways were in a state of Outage. Outage status is determined by automated ping telemetry monitors checking endpoint availabilities every 15 seconds.
              </p>
              
              {/* Credit Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--lp-border)', borderRadius: '12px', background: 'var(--lp-surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--lp-border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--lp-text)' }}>Monthly Uptime Range</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--lp-text)' }}>Service Fee Credit Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditTable.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < creditTable.length - 1 ? '1px solid var(--lp-border)' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>{row.uptime}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--lp-secondary)' }}>{row.credit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
                3. Support Response Commitments
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                We provide round-the-clock priority coverage for enterprise tier accounts. Outages and degraded service requests are verified by our operations engineer lead in minutes.
              </p>

              {/* Tiers Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--lp-border)', borderRadius: '12px', background: 'var(--lp-surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--lp-border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--lp-text)' }}>Priority Severity</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--lp-text)' }}>Response Guarantee</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--lp-text)' }}>Coverage Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTiers.map((tier, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < supportTiers.length - 1 ? '1px solid var(--lp-border)' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>{tier.priority}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--lp-accent)', fontWeight: 700 }}>{tier.response}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--lp-secondary)' }}>{tier.coverage} ({tier.channel})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Quick info widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--lp-accent)' }} /> Security Certifications
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                CloudPBX undergoes regular external SOC2 compliance checks.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                <li style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <Check size={12} color="var(--lp-success)" /> SOC2 Type II Certified
                </li>
                <li style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <Check size={12} color="var(--lp-success)" /> HIPAA Compliant trunks
                </li>
                <li style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <Check size={12} color="var(--lp-success)" /> ISO/IEC 27001 compliant
                </li>
              </ul>
            </div>

            <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={16} style={{ color: 'var(--lp-accent)' }} /> SLA Credit Request?
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
                Submit service credit requests directly to our customer success desk. File requests within 30 days of the outage events.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
