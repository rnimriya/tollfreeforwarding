import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sliders for calculator
  const [numLines, setNumLines] = useState<number>(3);
  const [numMinutes, setNumMinutes] = useState<number>(1500);

  const calculateEstimate = () => {
    // Basic billing estimation logic
    // $12 per virtual number + $0.025 per minute
    const lineCost = numLines * 12;
    const minuteCost = numMinutes * 0.025;
    let total = lineCost + minuteCost;
    
    // Apply 20% discount if annual
    if (billingCycle === 'annual') {
      total = total * 0.8;
    }
    
    // Recommend plan tier based on requirements
    let recommendedPlan = 'Starter';
    if (numLines > 5 || numMinutes > 2000) {
      recommendedPlan = 'Enterprise';
    } else if (numLines > 1 || numMinutes > 500) {
      recommendedPlan = 'Professional';
    }

    return {
      total: Math.round(total),
      recommendedPlan
    };
  };

  const { total: estimateTotal, recommendedPlan: recommendedTier } = calculateEstimate();

  const pricingTiers = [
    {
      name: 'Starter',
      monthlyPrice: 19,
      annualPrice: 15,
      desc: 'Essential routing for freelancers and small teams.',
      features: [
        '1 virtual line number',
        '500 monthly inbound minutes',
        'Standard IVR auto-attendant',
        'Forward calls to mobile/landline',
        'Call logs database (30 days)',
        'Standard email support',
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: '#6366f1'
    },
    {
      name: 'Professional',
      monthlyPrice: 49,
      annualPrice: 39,
      desc: 'Advanced visual IVR and analytics for growing organizations.',
      features: [
        '5 virtual line numbers included',
        '2,000 monthly inbound minutes',
        'Visual drag-and-drop IVR Builder',
        'Call recording & audio archiving',
        'Real-time analytics dashboard',
        'Webhook callback notification logs',
        'API endpoint access permissions',
        'Priority email & chat support',
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: '#22c55e'
    },
    {
      name: 'Enterprise',
      monthlyPrice: 149,
      annualPrice: 119,
      desc: 'Complete high-volume calling, customized integrations, and SLAs.',
      features: [
        'Unlimited virtual lines (provision-on-demand)',
        'Unlimited minutes (fair use policy)',
        'Custom IVR script node triggers',
        'Custom SIP Trunk mapping',
        'Dedicated server hosting points',
        'SSO / SAML secure auth integrations',
        'Guaranteed uptime contract SLA',
        '24/7 Phone support with SLA',
      ],
      cta: 'Contact Sales',
      popular: false,
      color: '#a855f7'
    }
  ];

  const faqsList = [
    {
      q: 'How does the 14-day free trial work?',
      a: 'Sign up without entering any credit card credentials. You will get access to a test virtual number and 100 free routing minutes. If you wish to upgrade to keep the line active, you can select a plan tier at any time.'
    },
    {
      q: 'Can I add extra virtual numbers or minutes to my current plan?',
      a: 'Yes! If you require extra lines or run over your minute quota, we apply standard flex-tier pricing ($5/month per extra number and $0.03/minute). We will send warnings before your quota runs out.'
    },
    {
      q: 'What is number porting and does it cost anything?',
      a: 'Number porting allows you to move your existing virtual or physical business lines from another carrier into CloudPBX. We support porting in over 40 countries and we perform it free of charge!'
    },
    {
      q: 'Is there an annual contract requirement?',
      a: 'No. Monthly plans can be cancelled anytime with a single click. Selecting annual billing guarantees a 20% discount on the equivalent monthly pricing tier.'
    },
    {
      q: 'Are toll-free numbers more expensive than local numbers?',
      a: 'Toll-free numbers (+1-800, etc.) are billed at the same flat rates as local business numbers on our platform. The routing cost remains simple and transparent.'
    }
  ];

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Simple & Flexible</span>
          <h2>Plans for Companies of Every Scale</h2>
          <p>Get started with a 14-day free trial. No setup fees, no contracts, cancel at any time.</p>

          {/* Toggle button */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--lp-surface)',
              border: '1px solid var(--lp-border)',
              padding: '0.3rem',
              borderRadius: '99px',
              marginTop: '2rem',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '99px',
                background: billingCycle === 'monthly' ? 'var(--lp-accent)' : 'transparent',
                color: billingCycle === 'monthly' ? '#fff' : 'var(--lp-secondary)',
                transition: 'all 0.15s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '99px',
                background: billingCycle === 'annual' ? 'var(--lp-accent)' : 'transparent',
                color: billingCycle === 'annual' ? '#fff' : 'var(--lp-secondary)',
                transition: 'all 0.15s',
              }}
            >
              Annual Billing <span style={{ color: 'var(--lp-success)', fontSize: '0.75rem', marginLeft: '4px', fontWeight: 700 }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="lp-plans" style={{ marginBottom: '5rem', alignItems: 'stretch' }}>
          {pricingTiers.map((tier, idx) => {
            const currentPrice = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            return (
              <div
                key={idx}
                className={`lp-plan ${tier.popular ? 'lp-plan--highlight' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {tier.popular && <div className="lp-plan-badge">Highly Recommended</div>}
                
                <div>
                  <div className="lp-plan-header">
                    <h3 className="lp-plan-name" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{tier.name}</h3>
                    <p className="lp-plan-desc">{tier.desc}</p>
                    <div className="lp-plan-price" style={{ margin: '1.5rem 0' }}>
                      <span className="lp-plan-currency">$</span>
                      <span className="lp-plan-amount">{currentPrice}</span>
                      <span className="lp-plan-period">/month</span>
                    </div>
                  </div>

                  <ul className="lp-plan-features" style={{ borderTop: '1px solid var(--lp-border)', paddingTop: '1.25rem' }}>
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} style={{ marginBottom: '0.5rem' }}>
                        <Check size={16} color={tier.color} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <Link
                    to="/register"
                    className="lp-plan-cta"
                    style={
                      tier.popular
                        ? {
                            background: 'var(--lp-accent)',
                            borderColor: 'var(--lp-accent)',
                            color: '#fff',
                            boxShadow: '0 8px 20px rgba(99,102,241,0.25)',
                          }
                        : {}
                    }
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Pricing Calculator Slider */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            marginBottom: '5rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--lp-accent-dim)',
                color: 'var(--lp-accent)',
                padding: '0.35rem 0.85rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={14} /> Custom Quota Calculator
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Estimate Your Calling Overhead</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)' }}>
              Drag the sliders below to match your operational usage and see recommended plan configurations instantly.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '3rem',
            }}
            className="lp-spotlight-inner"
          >
            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Virtual Numbers Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Virtual Numbers (Lines)</span>
                  <span style={{ fontWeight: 800, color: 'var(--lp-accent)', fontFamily: 'monospace' }}>
                    {numLines} Line{numLines > 1 ? 's' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numLines}
                  onChange={(e) => setNumLines(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--lp-border)',
                    outline: 'none',
                    accentColor: 'var(--lp-accent)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--lp-muted)', marginTop: '0.4rem' }}>
                  <span>1 line</span>
                  <span>25 lines</span>
                  <span>50 lines</span>
                </div>
              </div>

              {/* Monthly Minutes Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Inbound Call Minutes / month</span>
                  <span style={{ fontWeight: 800, color: 'var(--lp-accent)', fontFamily: 'monospace' }}>
                    {numMinutes.toLocaleString()} Mins
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={numMinutes}
                  onChange={(e) => setNumMinutes(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--lp-border)',
                    outline: 'none',
                    accentColor: 'var(--lp-accent)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--lp-muted)', marginTop: '0.4rem' }}>
                  <span>500 mins</span>
                  <span>25,000 mins</span>
                  <span>50,000 mins</span>
                </div>
              </div>

            </div>

            {/* Results Panel */}
            <div
              style={{
                background: 'var(--lp-elevated)',
                border: '1px solid var(--lp-border)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--lp-secondary)', fontWeight: 600 }}>ESTIMATED TOTAL</span>
              <div style={{ display: 'flex', alignItems: 'baseline', margin: '0.75rem 0' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lp-secondary)' }}>$</span>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--lp-text)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {estimateTotal}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', marginLeft: '4px' }}>/mo</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--lp-success)',
                  background: 'rgba(34,197,94,0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '99px',
                  marginBottom: '1.5rem',
                }}
              >
                <AlertCircle size={13} /> Recommended: <strong>{recommendedTier} Tier</strong>
              </div>

              <Link
                to="/register"
                className="lp-btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
              >
                Start Trial with this Config
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--lp-secondary)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              <HelpCircle size={16} /> Pricing FAQ
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Got Questions? We Have Answers.</h3>
          </div>

          <div className="lp-faqs">
            {faqsList.map((faq, i) => (
              <div
                key={i}
                className={`lp-faq ${openFaq === i ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="lp-faq-q">
                  <span>{faq.q}</span>
                  <span className="lp-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className="lp-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
