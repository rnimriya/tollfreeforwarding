import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Globe, Zap, Shield, BarChart2, Workflow,
  ChevronRight, Check, Star, ArrowRight, Play,
  Clock, Users, TrendingUp, Headphones, Layers, RefreshCw,
  PhoneCall, MapPin, Mail, Twitter, Github, Linkedin,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { useTheme } from '../stores/themeStore';
import './LandingPage.css';

// ── Animated counter hook ────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ───────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Static data ──────────────────────────────────────────────────────
const features = [
  { icon: Globe, title: 'Global Virtual Numbers', desc: 'Instant local, toll-free, and international numbers in 60+ countries. Active in seconds, no hardware required.', color: '#0A66C2' },
  { icon: Workflow, title: 'Visual IVR Builder', desc: 'Design intelligent call flows with drag-and-drop. Create menus, greetings, and routing rules without writing code.', color: '#00B4A6' },
  { icon: Clock, title: 'Time-Based Routing', desc: 'Route calls based on business hours, day of week, and timezone. Your callers always reach the right team.', color: '#10B981' },
  { icon: Zap, title: 'Sub-50ms Routing', desc: 'Ultra-low latency call routing engine ensures seamless connections. Zero perceptible delay for your customers.', color: '#0A66C2' },
  { icon: BarChart2, title: 'Real-Time Analytics', desc: 'Live dashboard with call volume, duration, outcomes, and missed-call tracking. Make data-driven decisions.', color: '#00B4A6' },
  { icon: Shield, title: 'Enterprise Security', desc: 'End-to-end encrypted SIP trunks, call recordings, HMAC webhook signatures, and SOC 2 compliant infrastructure.', color: '#10B981' },
];

const steps = [
  { num: '01', title: 'Get a Number', desc: 'Choose from local or toll-free numbers in 60 countries. Get your number active in seconds.', icon: Phone },
  { num: '02', title: 'Set up Routing', desc: 'Set up time of day rules, call groups, and phone menus. Use our simple visual builder.', icon: Workflow },
  { num: '03', title: 'Receive Calls', desc: 'Your number routes calls in real time. Track all calls from your main dashboard.', icon: PhoneCall },
];

const plans = [
  {
    name: 'Starter',
    price: 19,
    period: '/mo',
    desc: 'Perfect for freelancers and small teams',
    color: '#6366f1',
    features: ['1 virtual number', 'Basic call forwarding', '500 minutes/mo', 'Email support', 'Call logs (30 days)', 'Standard IVR'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Professional',
    price: 49,
    period: '/mo',
    desc: 'For growing businesses with smart routing needs',
    color: '#22c55e',
    features: ['5 virtual numbers', 'Visual IVR Builder', '2,000 minutes/mo', 'Priority support', 'Call recording', 'Advanced analytics', 'Webhook access', 'Time-based routing'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 149,
    period: '/mo',
    desc: 'Full-scale Cloud PBX for large organizations',
    color: '#a855f7',
    features: ['Unlimited numbers', 'Custom IVR flows', 'Unlimited minutes', 'Dedicated support', 'SIP trunk routing', 'White-label option', 'SLA guarantee', 'API & webhooks', 'SSO / SAML'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO, Streamline Inc.', avatar: 'SC', rating: 5, quote: 'CloudPBX helped our support team. We used to miss many calls. Now we do not miss any. The menu builder is simple to use.' },
  { name: 'Marcus Johnson', role: 'Founder, LaunchFast', avatar: 'MJ', rating: 5, quote: 'We have 12 numbers in 6 countries and they work well. Time-based routing saved us from hiring a night worker.' },
  { name: 'Priya Sharma', role: 'Head of Sales, Nexus CRM', avatar: 'PS', rating: 5, quote: 'The stats dashboard is great. I can see call count, average call length, and missed calls in one place.' },
];

const faqs = [
  { q: 'How fast can I get a new number?', a: 'In seconds. Your numbers are active and ready to receive calls as soon as you buy them.' },
  { q: 'Do I need to install any hardware or software?', a: 'No. CloudPBX runs in the cloud. You can forward calls to your cell phone or computer.' },
  { q: 'Can I port my existing number?', a: 'Yes. We support number porting from most providers. The process takes 5 to 7 days.' },
  { q: 'What happens if I exceed my minute plan?', a: 'We will notify you. You can upgrade or pay a small fee per minute. We do not cut off your calls.' },
  { q: 'Is there a free trial?', a: 'Yes. You get a 14 day trial. You do not need a credit card to start.' },
];

// ── Main Component ────────────────────────────────────────────────────
export default function LandingPage() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const statsRef = useInView(0.3);
  const callsCount = useCounter(2_400_000, 2500, statsRef.inView);
  const countriesCount = useCounter(60, 1800, statsRef.inView);
  const uptimeCount = useCounter(99, 2000, statsRef.inView);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="landing">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className={`lp-nav${isScrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">📞</div>
            <span className="lp-logo-text">Cloud<span>PBX</span></span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid var(--lp-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--lp-text)',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {token ? (
              <Link to="/dashboard" className="lp-btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="lp-btn-ghost">Sign In</Link>
                <Link to="/register" className="lp-btn-primary">Get Your Number</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-grid-overlay" />
          {/* World map connection lines */}
          <svg className="lp-connections-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0A66C2" stopOpacity="0" />
                <stop offset="50%" stopColor="#00B4A6" stopOpacity="1" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 200 400 Q 400 200 720 350 Q 1000 480 1200 300" strokeWidth="1.5" />
            <path d="M 100 300 Q 350 500 600 280 Q 900 100 1100 350" strokeWidth="1" style={{animationDelay:'2s'}} />
            <path d="M 300 600 Q 600 350 900 500 Q 1100 580 1350 400" strokeWidth="1" style={{animationDelay:'4s'}} />
            <path d="M 50 500 Q 250 300 500 450 Q 750 580 1000 350 Q 1200 200 1400 420" strokeWidth="0.8" style={{animationDelay:'1s'}} />
          </svg>
          {/* Location dots */}
          <div className="lp-connection-dots">
            {[
              {top:'28%', left:'14%', delay:'0s'},   /* New York */
              {top:'22%', left:'46%', delay:'0.8s'},  /* London */
              {top:'32%', left:'55%', delay:'1.2s'},  /* Frankfurt */
              {top:'36%', left:'72%', delay:'0.4s'},  /* Mumbai */
              {top:'24%', left:'80%', delay:'1.8s'},  /* Tokyo */
              {top:'55%', left:'18%', delay:'2.2s'},  /* São Paulo */
              {top:'30%', left:'35%', delay:'3s'},    /* Reykjavik */
              {top:'48%', left:'76%', delay:'1.5s'},  /* Singapore */
            ].map((d, i) => (
              <div key={i} className="lp-dot" style={{ top: d.top, left: d.left, animationDelay: d.delay }} />
            ))}
          </div>
        </div>
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <Zap size={12} />
            <span>Sub-50ms routing &nbsp;·&nbsp; 99.99% uptime SLA &nbsp;·&nbsp; 60+ countries</span>
          </div>
          <h1 className="lp-hero-title">
            Global Virtual Numbers<br />&amp;&nbsp;
            <span className="lp-gradient-text">Cloud PBX</span>
          </h1>
          <p className="lp-hero-subtitle">
            Get a professional phone system in minutes. Instant forwarding worldwide, intelligent IVR menus, and real-time analytics — no hardware, no IT team.
          </p>
          <div className="lp-hero-ctas">
            {token ? (
              <Link to="/dashboard" className="lp-btn-hero-primary">
                Go to Dashboard <ArrowRight size={17} />
              </Link>
            ) : (
              <Link to="/register" className="lp-btn-hero-primary">
                Get Your Number Free <ArrowRight size={17} />
              </Link>
            )}
            <a href="#how" className="lp-btn-hero-ghost">
              <span className="lp-play-btn"><Play size={12} fill="white" /></span>
              See how it works
            </a>
          </div>
          <div className="lp-hero-trust">
            <div className="lp-trust-avatars">
              {['A','B','C','D','E'].map((l) => (
                <div key={l} className="lp-trust-avatar">{l}</div>
              ))}
            </div>
            <div>
              <div className="lp-trust-stars">{'★★★★★'}</div>
              <div className="lp-trust-text">Trusted by 12,000 businesses.</div>
            </div>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="lp-hero-mockup">
          <div className="lp-mockup-card">
            <div className="lp-mockup-header">
              <div className="lp-mockup-dots">
                <span style={{background:'#ef4444'}} /><span style={{background:'#f59e0b'}} /><span style={{background:'#22c55e'}} />
              </div>
              <div className="lp-mockup-title">CloudPBX Dashboard</div>
            </div>
            <div className="lp-mockup-body">
              <div className="lp-mockup-stats">
                {[
                  { label: 'Active Numbers', value: '12', delta: '+3', color: '#6366f1' },
                  { label: 'Calls Today', value: '284', delta: '+12%', color: '#22c55e' },
                  { label: 'Avg Duration', value: '4m 22s', delta: '↑', color: '#38bdf8' },
                ].map((s) => (
                  <div key={s.label} className="lp-mock-stat">
                    <div className="lp-mock-stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="lp-mock-stat-label">{s.label}</div>
                    <div className="lp-mock-stat-delta" style={{ color: s.color }}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="lp-mock-chart">
                {[40,65,45,80,60,90,75,85,70,95,80,100].map((h, i) => (
                  <div key={i} className="lp-mock-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <div className="lp-mock-numbers">
                {[
                  { num: '+1 (800) 555-0100', name: 'Sales Line', status: 'ACTIVE' },
                  { num: '+1 (415) 555-0199', name: 'Support', status: 'ACTIVE' },
                  { num: '+44 20 7123 4567', name: 'UK Office', status: 'ACTIVE' },
                ].map((n) => (
                  <div key={n.num} className="lp-mock-num-row">
                    <div className="lp-mock-num-dot" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{n.num}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--lp-muted)' }}>{n.name}</div>
                    </div>
                    <div className="lp-mock-badge">{n.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-mockup-float lp-mockup-float-1">
            <PhoneCall size={14} color="#22c55e" />
            <span>Call routed in <b>12ms</b></span>
          </div>
          <div className="lp-mockup-float lp-mockup-float-2">
            <Globe size={14} color="#6366f1" />
            <span><b>+44</b> London → Support</span>
          </div>
        </div>
      </section>

      {/* ── Trusted by logos ─────────────────────────────────────────── */}
      <div className="lp-logos-band">
        <div className="lp-container">
          <div className="lp-logos-inner">
            <span className="lp-logos-label">Trusted by teams at</span>
            {[
              { icon: '🏦', name: 'FinanceCore' },
              { icon: '🛒', name: 'ShopDirect' },
              { icon: '🏥', name: 'HealthNet' },
              { icon: '⚡', name: 'StartupIO' },
              { icon: '🌐', name: 'GlobalTech' },
              { icon: '📊', name: 'DataFlow' },
            ].map((l) => (
              <div key={l.name} className="lp-logo-pill">
                <span className="lp-logo-pill-icon">{l.icon}</span>
                {l.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="lp-stats" ref={statsRef.ref}>
        <div className="lp-container">
          <div className="lp-stats-grid">
            {[
              { value: callsCount.toLocaleString() + '+', label: 'Calls Routed Monthly', icon: PhoneCall, color: '#0A66C2' },
              { value: countriesCount + '+', label: 'Countries Supported', icon: Globe, color: '#00B4A6' },
              { value: uptimeCount + '.99%', label: 'Uptime SLA', icon: Shield, color: '#10B981' },
              { value: '< 50ms', label: 'Routing Latency', icon: Zap, color: '#0A66C2' },
            ].map((s) => (
              <div key={s.label} className="lp-stat-item">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <div className="lp-stat-num" style={{ color: s.color }}>{s.value}</div>
                <div className="lp-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-badge">Features</div>
            <h2>Everything your business phone system needs</h2>
            <p>CloudPBX handles call forwarding and phone menus. You do not need any hardware.</p>
          </div>
          <div className="lp-features-grid">
            {features.map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <f.icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IVR Builder spotlight ─────────────────────────────────────── */}
      <section className="lp-spotlight">
        <div className="lp-container lp-spotlight-inner">
          <div className="lp-spotlight-text">
            <div className="lp-section-badge">Visual IVR Builder</div>
            <h2>Design call flows without writing code</h2>
            <p>Our builder lets you create custom routing rules. Add greetings, menus, and forwarding. Publish changes with one click.</p>
            <ul className="lp-spotlight-list">
              {['Six node types including greetings and menus', 'Preview your flow and publish with one click', 'Set options for dial pad buttons', 'Route calls based on business hours'].map((item) => (
                <li key={item}><Check size={15} color="var(--lp-accent)" /><span>{item}</span></li>
              ))}
            </ul>
            <Link to="/register" className="lp-btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Try IVR Builder Free <ChevronRight size={16} />
            </Link>
          </div>
          <div className="lp-ivr-preview">
            <div className="lp-ivr-canvas">
              {/* Simulated IVR node graph */}
              <div className="lp-ivr-node lp-ivr-node--greeting" style={{ top: 20, left: '50%', transform: 'translateX(-50%)' }}>
                <span>🎙️</span> Welcome Greeting
              </div>
              <div className="lp-ivr-connector lp-ivr-conn-center" />
              <div className="lp-ivr-node lp-ivr-node--menu" style={{ top: 110, left: '50%', transform: 'translateX(-50%)' }}>
                <span>📋</span> IVR Menu
              </div>
              <div className="lp-ivr-branches">
                <div className="lp-ivr-branch">
                  <div className="lp-ivr-branch-line" />
                  <div className="lp-ivr-branch-label">Press 1</div>
                  <div className="lp-ivr-node lp-ivr-node--forward">
                    <span>📞</span> Sales
                  </div>
                </div>
                <div className="lp-ivr-branch">
                  <div className="lp-ivr-branch-line" />
                  <div className="lp-ivr-branch-label">Press 2</div>
                  <div className="lp-ivr-node lp-ivr-node--forward lp-ivr-node--support">
                    <span>🎧</span> Support
                  </div>
                </div>
                <div className="lp-ivr-branch">
                  <div className="lp-ivr-branch-line" />
                  <div className="lp-ivr-branch-label">Timeout</div>
                  <div className="lp-ivr-node lp-ivr-node--voicemail">
                    <span>📬</span> Voicemail
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="lp-section" id="how">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-badge">How It Works</div>
            <h2>Up and running in under 5 minutes</h2>
            <p>No hardware, no IT team, no waiting. Get your virtual phone system live today.</p>
          </div>
          <div className="lp-steps">
            {steps.map((s, i) => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon"><s.icon size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="lp-step-arrow"><ChevronRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="lp-section lp-pricing-section" id="pricing">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-badge">Pricing</div>
            <h2>Simple, transparent pricing</h2>
            <p>No setup fees, no contracts. Start with a 14-day free trial on any plan.</p>
          </div>
          <div className="lp-plans">
            {plans.map((p) => (
              <div key={p.name} className={`lp-plan${p.highlight ? ' lp-plan--highlight' : ''}`}>
                {p.highlight && <div className="lp-plan-badge">Most Popular</div>}
                <div className="lp-plan-header">
                  <div className="lp-plan-icon" style={{ background: `${p.color}18`, color: p.color }}>
                    <Layers size={18} />
                  </div>
                  <div className="lp-plan-name">{p.name}</div>
                  <div className="lp-plan-desc">{p.desc}</div>
                  <div className="lp-plan-price">
                    <span className="lp-plan-currency">$</span>
                    <span className="lp-plan-amount">{p.price}</span>
                    <span className="lp-plan-period">{p.period}</span>
                  </div>
                </div>
                <ul className="lp-plan-features">
                  {p.features.map((f) => (
                    <li key={f}><Check size={14} color={p.color} /><span>{f}</span></li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="lp-plan-cta"
                  style={p.highlight ? { background: p.color, color: '#fff', boxShadow: `0 8px 24px ${p.color}44` } : {}}
                >
                  {p.cta} <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
          <p className="lp-pricing-note">
            All plans include a 14 day free trial. You do not need a credit card. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-badge">Testimonials</div>
            <h2>Loved by thousands of businesses</h2>
          </div>
          <div className="lp-testimonials">
            {testimonials.map((t) => (
              <div key={t.name} className="lp-testimonial">
                <div className="lp-testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className="lp-testimonial-quote">"{t.quote}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="lp-section" id="faq">
        <div className="lp-container lp-faq-container">
          <div className="lp-section-header">
            <div className="lp-section-badge">FAQ</div>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="lp-faqs">
            {faqs.map((f, i) => (
              <div key={i} className={`lp-faq${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="lp-faq-q">
                  <span>{f.q}</span>
                  <span className="lp-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className="lp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="lp-cta-banner">
        <div className="lp-orb lp-orb-cta-1" />
        <div className="lp-orb lp-orb-cta-2" />
        <div className="lp-container lp-cta-inner">
          <h2>Ready to go global in<br /><span className="lp-gradient-text">minutes, not months?</span></h2>
          <p>Join 12,000+ businesses already using CloudPBX. Get your first number active today — no contracts, no hardware.</p>
          <div className="lp-cta-actions">
            {token ? (
              <Link to="/dashboard" className="lp-btn-hero-primary">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="lp-btn-hero-primary">
                  Start Free Trial with No Credit Card <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="lp-btn-hero-ghost" style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Sign In to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="lp-logo" style={{ marginBottom: '1rem' }}>
                <div className="lp-logo-icon">📞</div>
                <span className="lp-logo-text">Cloud<span>PBX</span></span>
              </div>
              <p>Get virtual numbers, call routing, and real-time stats in one simple tool.</p>
              <div className="lp-footer-social">
                <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
                <a href="#" aria-label="GitHub"><Github size={17} /></a>
                <a href="#" aria-label="LinkedIn"><Linkedin size={17} /></a>
              </div>
            </div>
            {[
              {
                heading: 'Product',
                links: [
                  { label: 'Features', to: '/features' },
                  { label: 'Pricing', to: '/pricing' },
                  { label: 'IVR Builder', to: '/ivr' },
                  { label: 'Analytics', to: '/analytics' },
                  { label: 'API Docs', to: '/api-docs' },
                  { label: 'Webhooks', to: '/webhooks' }
                ]
              },
              {
                heading: 'Company',
                links: [
                  { label: 'About', to: '/about' },
                  { label: 'Blog', to: '/blog' },
                  { label: 'Careers', to: '/careers' },
                  { label: 'Press Kit', to: '/press-kit' },
                  { label: 'Affiliates', to: '/affiliates' }
                ]
              },
              {
                heading: 'Support',
                links: [
                  { label: 'Documentation', to: '/docs' },
                  { label: 'Status Page', to: '/status' },
                  { label: 'Contact Us', to: '/contact' },
                  { label: 'Community Forum', to: '/community' },
                  { label: 'SLA', to: '/sla' }
                ]
              },
            ].map((col) => (
              <div key={col.heading} className="lp-footer-col">
                <h4>{col.heading}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 CloudPBX, Inc. All rights reserved.</span>
            <div className="lp-footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
