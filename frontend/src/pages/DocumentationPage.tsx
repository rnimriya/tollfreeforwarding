import { useState } from 'react';
import { Search, BookOpen, Key, Phone, Settings, RefreshCw, X, ArrowRight } from 'lucide-react';

interface DocArticle {
  id: string;
  category: 'getting_started' | 'configs' | 'porting' | 'integrations';
  title: string;
  desc: string;
  steps: string[];
}

const articlesList: DocArticle[] = [
  {
    id: 'art_1',
    category: 'getting_started',
    title: 'Provisioning Your First Virtual Number',
    desc: 'Learn how to claim a new virtual routing number inside your business account dashboard.',
    steps: [
      'Log in to your Dashboard overview page.',
      'Navigate to the Virtual Numbers sub-menu on the left sidebar.',
      'Click the "+ Claim Number" button in the top right corner.',
      'Select a country, choose a local or toll-free line prefix, and verify availability.',
      'Confirm billing plan tier and click Purchase. Your line will activate immediately.'
    ]
  },
  {
    id: 'art_2',
    category: 'configs',
    title: 'Building a Multi-Level IVR Menu',
    desc: 'How to structure automated attendants with greet messages, press menus, and voicemail blocks.',
    steps: [
      'Navigate to Virtual Numbers, click details settings on your active line.',
      'Select "Visual IVR" as your preferred routing target type, and click "Edit Flow".',
      'Drag a Greeting Node onto the canvas. Set your Welcome speech announcement (Text-to-Speech).',
      'Link the greeting outputs to a Menu Node. Configure key options (e.g., Press 1, Press 2).',
      'Link keypress selections to Forwarding Nodes (agent numbers) or Voicemail Boxes.',
      'Click "Save & Publish" to update carrier routing paths instantly.'
    ]
  },
  {
    id: 'art_3',
    category: 'porting',
    title: 'Submitting a Free Number Porting Request',
    desc: 'Move existing business local or national numbers into CloudPBX with zero service downtime.',
    steps: [
      'Collect your recent billing document and a signed Letter of Authorization (LOA).',
      'Go to the Help/Contact support page.',
      'Select "Carrier Porting Inquiry" in the contact dropdown list.',
      'Upload files, list the E.164 numbers to port, and click submit.',
      'Our carrier operations lead will coordinate the port in 5 to 7 days.'
    ]
  },
  {
    id: 'art_4',
    category: 'integrations',
    title: 'Configuring API Keys & Verification Signatures',
    desc: 'Generate API credentials and securely authorize developer HTTP requests.',
    steps: [
      'Navigate to Dashboard settings, click API Credentials tab.',
      'Click "+ Generate Key" to generate a live cpbx_live_•••• api token.',
      'Save your secret key securely. You cannot retrieve it again.',
      'Use the Bearer authorization headers in all HTTP REST endpoints.',
      'Audit webhook callback payloads using your verification secret key to match signatures.'
    ]
  }
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);

  const categories = {
    getting_started: { label: 'Getting Started', icon: BookOpen },
    configs: { label: 'Number Configuration', icon: Settings },
    porting: { label: 'Carrier Porting', icon: Phone },
    integrations: { label: 'API & Webhooks', icon: Key },
  };

  const filteredArticles = articlesList.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Help Center</span>
          <h2>Platform Documentation & Guides</h2>
          <p>Find step-by-step instructions on setting up numbers, designing voice menus, and integrating webhook keys.</p>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '2rem auto 0 auto' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--lp-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search help articles (e.g. IVR, porting, keys)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                paddingLeft: '44px',
                fontSize: '0.95rem',
                borderRadius: '12px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border-strong)',
                height: '48px',
              }}
            />
          </div>
        </div>

        {/* Help Categories Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {Object.entries(categories).map(([key, cat]) => {
            const IconComp = cat.icon;
            const catArticles = filteredArticles.filter((art) => art.category === key);

            return (
              <div
                key={key}
                style={{
                  background: 'var(--lp-surface)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--lp-border)', paddingBottom: '0.75rem' }}>
                  <div style={{ background: 'var(--lp-accent-dim)', color: 'var(--lp-accent)', padding: '0.45rem', borderRadius: '8px' }}>
                    <IconComp size={16} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{cat.label}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {catArticles.length > 0 ? (
                    catArticles.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        style={{
                          textAlign: 'left',
                          fontSize: '0.82rem',
                          color: 'var(--lp-secondary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem 0',
                          lineHeight: 1.4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                        className="btn-ghost"
                      >
                        <span style={{ flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {art.title}
                        </span>
                        <ArrowRight size={12} style={{ color: 'var(--lp-accent)', flexShrink: 0, marginLeft: '6px' }} />
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--lp-muted)' }}>No articles found.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Popular guides cards */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center' }}>Featured Core Guides</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {articlesList.slice(0, 3).map((art) => (
              <div
                key={art.id}
                className="lp-feature-card"
                onClick={() => setSelectedArticle(art)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--lp-text)' }}>{art.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {art.desc}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--lp-border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--lp-accent)', fontWeight: 600 }}>
                  <span>Read Guide</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Article content modal */}
        {selectedArticle && (
          <div className="modal-backdrop" onClick={() => setSelectedArticle(null)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '600px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border-strong)',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--lp-accent)' }}>
                    {categories[selectedArticle.category].label}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--lp-text)' }}>{selectedArticle.title}</h3>
                </div>
                <button onClick={() => setSelectedArticle(null)} style={{ color: 'var(--lp-secondary)', cursor: 'pointer' }} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

              {/* Steps progression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>
                  {selectedArticle.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedArticle.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--lp-accent-dim)',
                          color: 'var(--lp-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--lp-text)', lineHeight: 1.5, marginTop: '2px' }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
