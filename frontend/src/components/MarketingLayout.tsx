import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sun, Moon, Twitter, Github, Linkedin, Menu, X } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { useTheme } from '../stores/themeStore';

export default function MarketingLayout() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const productLinks = [
    { label: 'Features', to: '/features' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'IVR Builder', to: '/ivr' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'API Docs', to: '/api-docs' },
    { label: 'Webhooks', to: '/webhooks' },
  ];

  const companyLinks = [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press Kit', to: '/press-kit' },
    { label: 'Affiliates', to: '/affiliates' },
  ];

  const supportLinks = [
    { label: 'Documentation', to: '/docs' },
    { label: 'Status Page', to: '/status' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Community Forum', to: '/community' },
    { label: 'SLA', to: '/sla' },
  ];

  return (
    <div className="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <nav className="lp-nav scrolled" style={{ position: 'sticky', top: 0, width: '100%' }}>
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="lp-logo-icon">📞</div>
            <span className="lp-logo-text">Cloud<span>PBX</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/ivr">IVR Builder</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/api-docs">API</Link>
            <Link to="/links" style={{ color: 'var(--lp-accent)', fontWeight: 'bold' }}>All Pages</Link>
          </div>

          <div className="lp-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme Toggle */}
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
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth Buttons */}
            <div className="lp-nav-desktop-auth" style={{ display: 'flex', gap: '0.5rem' }}>
              {token ? (
                <Link to="/dashboard" className="lp-btn-primary">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="lp-btn-ghost">Sign In</Link>
                  <Link to="/register" className="lp-btn-primary">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid var(--lp-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--lp-text)',
                cursor: 'pointer'
              }}
              className="lp-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--lp-surface)',
              borderBottom: '1px solid var(--lp-border)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              zIndex: 99
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>Features</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>Pricing</Link>
              <Link to="/ivr" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>IVR Builder</Link>
              <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>Analytics</Link>
              <Link to="/api-docs" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>API Docs</Link>
              <Link to="/webhooks" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-secondary)', fontSize: '0.95rem' }}>Webhooks</Link>
              <Link to="/links" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--lp-accent)', fontWeight: 'bold', fontSize: '0.95rem' }}>All Pages Directory</Link>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--lp-border)' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              {token ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="lp-btn-primary" style={{ width: '100%', textAlign: 'center' }}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="lp-btn-ghost" style={{ width: '100%', textAlign: 'center' }}>Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="lp-btn-primary" style={{ width: '100%', textAlign: 'center' }}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Adding custom mobile toggle styling inline so that it works seamlessly */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav-desktop-auth { display: none !important; }
          .lp-mobile-toggle { display: flex !important; }
        }
      `}</style>

      {/* Main Page Area */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Shared Footer */}
      <footer className="lp-footer" style={{ marginTop: 'auto' }}>
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link to="/" className="lp-logo" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <div className="lp-logo-icon">📞</div>
                <span className="lp-logo-text">Cloud<span>PBX</span></span>
              </Link>
              <p>Virtual numbers, advanced IVR routing, and instant call analytics in one developer-friendly cloud platform.</p>
              <div className="lp-footer-social">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={17} /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
              </div>
            </div>

            <div className="lp-footer-col">
              <h4>Product</h4>
              <ul>
                {productLinks.map((link) => (
                  <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul>
                {companyLinks.map((link) => (
                  <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>Support</h4>
              <ul>
                {supportLinks.map((link) => (
                  <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 CloudPBX, Inc. All rights reserved.</span>
            <div className="lp-footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
              <Link to="/sla">SLA</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/links">Directory</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
