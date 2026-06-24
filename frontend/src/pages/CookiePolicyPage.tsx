import { ShieldCheck } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">
        <div className="lp-section-header">
          <span className="lp-section-badge">Legal</span>
          <h2>Cookie Policy</h2>
          <p>Last updated: October 2026</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            1. What Are Cookies
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            2. How We Use Cookies
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes: to enable certain functions of the Service, to provide analytics, to store your preferences, and to enable advertisements delivery, including behavioral advertising.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            3. Third-party Cookies
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
          </p>

          <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '16px', padding: '1.5rem', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--lp-accent)' }} /> Managing Cookies
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
              If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
