import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">
        <div className="lp-section-header">
          <span className="lp-section-badge">Legal</span>
          <h2>Terms of Service</h2>
          <p>Last updated: October 2026</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            1. Acceptance of Terms
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            By accessing and using our services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            2. Service Rules and Acceptable Use
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service; (iii) transmitting spam, chain letters, or other unsolicited email.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            3. User Accounts
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            You may need to register for a User Account in order to use certain aspects of the Service. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.
          </p>

          <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '16px', padding: '1.5rem', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} style={{ color: 'var(--lp-accent)' }} /> Need further assistance?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
              If you have any questions about these Terms, please contact us at legal@cloudpbx.example.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
