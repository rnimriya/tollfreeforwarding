import { useState } from 'react';
import { Award, DollarSign, Users, ShieldCheck, Send, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AffiliatesPage() {
  const [referredUsers, setReferredUsers] = useState<number>(50);
  const [planValue, setPlanValue] = useState<number>(49); // Professional Plan is $49

  // Application form states
  const [affName, setAffName] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affWebsite, setAffWebsite] = useState('');
  const [affStrategy, setAffStrategy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // calculate commission: 20% lifetime payouts
  const calculatedPayout = Math.round(referredUsers * planValue * 0.2);

  const benefits = [
    { icon: DollarSign, title: '20% Lifetime Commissions', desc: 'Earn recurring payouts as long as your referred businesses maintain active lines.' },
    { icon: Users, title: '90-Day Cookie Duration', desc: 'Get rewarded for user clicks up to 90 days after their initial site visit.' },
    { icon: Award, title: 'Dedicated Affiliate Portal', desc: 'Track clicks, referrals, conversions, and monthly payout records in one layout.' },
    { icon: ShieldCheck, title: 'Guaranteed Payout Schedule', desc: 'Commissions are calculated automatically and paid directly via PayPal/Stripe on the 15th of each month.' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affName || !affEmail || !affWebsite) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Affiliate application received! Our team will review your details in 48 hours.');
      setAffName('');
      setAffEmail('');
      setAffWebsite('');
      setAffStrategy('');
    }, 1200);
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Partners Program</span>
          <h2>Earn Lifetime Recurring Commissions</h2>
          <p>Join the CloudPBX affiliate network. Partner with a premium telecom switch and earn 20% revenue share on all referrals.</p>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {benefits.map((b, idx) => {
            const IconComp = b.icon;
            return (
              <div key={idx} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--lp-accent)', marginBottom: '1rem' }}>
                  <IconComp size={20} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{b.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Commission Calculator & Sign Up Form Dual Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--lp-shadow-card)',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Earnings calculator */}
          <div
            style={{
              padding: '2.5rem',
              borderRight: '1px solid var(--lp-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Referral Revenue Calculator</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', marginBottom: '2rem' }}>
                Drag the sliders below to estimate your recurring commission payout size.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Referrals Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Referrals</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--lp-accent)', fontFamily: 'monospace' }}>
                      {referredUsers} Accounts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={referredUsers}
                    onChange={(e) => setReferredUsers(parseInt(e.target.value))}
                    style={{ width: '100%', height: '6px', accentColor: 'var(--lp-accent)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--lp-muted)', marginTop: '0.35rem' }}>
                    <span>5 accounts</span>
                    <span>250 accounts</span>
                    <span>500 accounts</span>
                  </div>
                </div>

                {/* Average Plan Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Subscription Plan</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--lp-accent)', fontFamily: 'monospace' }}>
                      ${planValue} /mo
                    </span>
                  </div>
                  <select
                    value={planValue}
                    onChange={(e) => setPlanValue(parseInt(e.target.value))}
                    className="input"
                    style={{ appearance: 'auto', fontSize: '0.85rem', padding: '0.5rem' }}
                  >
                    <option value="19">Starter ($19/mo)</option>
                    <option value="49">Professional ($49/mo)</option>
                    <option value="149">Enterprise ($149/mo)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Estimated Output */}
            <div
              style={{
                background: 'var(--lp-bg)',
                border: '1px solid var(--lp-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                marginTop: '2rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--lp-secondary)', fontWeight: 600 }}>ESTIMATED MONTHLY COMMISSION</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lp-secondary)' }}>$</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--lp-text)', fontFamily: 'monospace' }}>
                  {calculatedPayout}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', marginLeft: '4px' }}>/mo (Recurring)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--lp-muted)', lineHeight: 1.4 }}>
                Calculated at a flat 20% lifetime payout rate. True conversions depend on client retention.
              </p>
            </div>
          </div>

          {/* Join program Form (Right) */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Apply for Partner Code</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Company / Full Name *</label>
                <input
                  type="text"
                  required
                  value={affName}
                  onChange={(e) => setAffName(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="Acme Partners"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={affEmail}
                  onChange={(e) => setAffEmail(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="partner@company.com"
                />
              </div>

              <div className="form-group">
                <label>Primary Site URL / Channel *</label>
                <input
                  type="url"
                  required
                  value={affWebsite}
                  onChange={(e) => setAffWebsite(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="https://company.com"
                />
              </div>

              <div className="form-group">
                <label>Referral Promotion Plan</label>
                <textarea
                  rows={2}
                  value={affStrategy}
                  onChange={(e) => setAffStrategy(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.85rem', resize: 'vertical' }}
                  placeholder="How do you plan to promote CloudPBX? (e.g. blog, client consulting, newsletter)..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: submitting ? 'var(--lp-muted)' : 'var(--lp-accent)',
                  marginTop: '0.5rem',
                }}
              >
                <Send size={14} /> {submitting ? 'Submitting strategy...' : 'Join Partner Program'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
