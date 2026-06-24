import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">
        <div className="lp-section-header">
          <span className="lp-section-badge">Legal</span>
          <h2>Privacy Policy</h2>
          <p>Last updated: October 2026</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            1. Information We Collect
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            2. How We Use Your Information
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            We may use the information we collect about you to: Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--lp-text)' }}>
            3. Sharing of Information
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: With third party service providers who need access to such information to carry out work on our behalf.
          </p>

          <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '16px', padding: '1.5rem', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--lp-accent)' }} /> Security First
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
              Your privacy and security are our top priority. We implement industry-standard security measures to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
