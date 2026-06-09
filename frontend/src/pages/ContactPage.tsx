import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, X, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formType, setFormType] = useState('general');
  const [formMsg, setFormMsg] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Live Chat Simulator State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Hi! Welcome to CloudPBX support. How can I help you today?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMsg) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    setTimeout(() => {
      setFormSubmitting(false);
      toast.success('Inquiry submitted! Our support team will respond in under 2 hours.');
      setFormName('');
      setFormEmail('');
      setFormMsg('');
    }, 1200);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      setChatLoading(false);
      let botResponse = "I can definitely help with that! Let me direct you to our onboarding documentation, or you can register for a trial account to test virtual routing.";
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        botResponse = "Our plan tiers start at $19/mo. For custom limits, check our Pricing page and play with the slider calculator!";
      } else if (userText.toLowerCase().includes('port') || userText.toLowerCase().includes('move')) {
        botResponse = "We perform carrier number porting in 40+ countries completely free of charge. Simply send your current bill LOA details to support.";
      } else if (userText.toLowerCase().includes('api') || userText.toLowerCase().includes('webhook')) {
        botResponse = "You can view complete curl and JSON outputs inside our Developer API Docs or Webhooks sections.";
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0', position: 'relative' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Get in Touch</span>
          <h2>We Are Here to Assist</h2>
          <p>Have questions about line porting, REST API integrations, or pricing packages? Connect with our support team.</p>
        </div>

        {/* Form and Details Dual Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3rem',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Contact form */}
          <div
            style={{
              background: 'var(--lp-surface)',
              border: '1px solid var(--lp-border)',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: 'var(--lp-shadow-card)',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Send Support Ticket</h3>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="input"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Inquiry Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="input"
                  style={{ appearance: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="general">General Sales Inquiry</option>
                  <option value="api">REST API / Webhook Integrations help</option>
                  <option value="porting">Carrier Number Porting Request</option>
                  <option value="incident">Report Outage / Incident Event</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message Content *</label>
                <textarea
                  required
                  rows={5}
                  value={formMsg}
                  onChange={(e) => setFormMsg(e.target.value)}
                  className="input"
                  placeholder="Tell us what you need support with..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary"
                style={{
                  justifyContent: 'center',
                  background: formSubmitting ? 'var(--lp-muted)' : 'var(--lp-accent)',
                  marginTop: '0.5rem',
                }}
              >
                <Send size={14} /> {formSubmitting ? 'Submitting ticket...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>

          {/* Details Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Location Address */}
            <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>Acme Offices</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--lp-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>San Francisco HQ</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.4, marginTop: '0.15rem' }}>
                      100 Pine Street, Suite 1250<br />San Francisco, CA 94111, USA
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--lp-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>London Office</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--lp-secondary)', lineHeight: 1.4, marginTop: '0.15rem' }}>
                      20 St Dunstan's Hill<br />London, EC3R 8HL, United Kingdom
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct support tags */}
            <div
              style={{
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Contact Info</h3>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={16} style={{ color: 'var(--lp-accent)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--lp-muted)', fontWeight: 600 }}>General Support Email</div>
                  <a href="mailto:support@cloudpbx.com" style={{ fontSize: '0.85rem', color: 'var(--lp-text)', fontWeight: 700 }}>
                    support@cloudpbx.com
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--lp-accent)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--lp-muted)', fontWeight: 600 }}>Hotline Phone (SLA)</div>
                  <a href="tel:+18005550199" style={{ fontSize: '0.85rem', color: 'var(--lp-text)', fontWeight: 700 }}>
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Simulator Toggle Bubble */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--lp-accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              cursor: 'pointer',
              zIndex: 999,
              border: 'none',
            }}
            aria-label="Open Live Chat Simulator"
          >
            <MessageSquare size={24} />
          </button>
        )}

        {/* Chat Widget Window */}
        {chatOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '340px',
              height: '460px',
              background: 'var(--lp-surface)',
              border: '1px solid var(--lp-border-strong)',
              borderRadius: '20px',
              boxShadow: 'var(--lp-shadow-float)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'var(--lp-accent)',
                color: '#fff',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--lp-success)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>CloudPBX Agent Simulator</span>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ color: '#fff', cursor: 'pointer' }} aria-label="Close Chat">
                <X size={16} />
              </button>
            </div>

            {/* Messages box */}
            <div
              style={{
                flexGrow: 1,
                padding: '1.25rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--lp-bg)',
              }}
            >
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--lp-accent)' : 'var(--lp-surface)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--lp-text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--lp-border)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: msg.sender === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
                    fontSize: '0.82rem',
                    maxWidth: '85%',
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </div>
              ))}

              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', padding: '0.6rem 0.9rem', borderRadius: '14px 14px 14px 0', fontSize: '0.8rem', display: 'flex', gap: '0.2rem' }}>
                  <span className="dot" style={{ width: '5px', height: '5px', background: 'var(--lp-muted)', borderRadius: '50%', animation: 'chat-dot 1s infinite' }} />
                  <span className="dot" style={{ width: '5px', height: '5px', background: 'var(--lp-muted)', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.2s' }} />
                  <span className="dot" style={{ width: '5px', height: '5px', background: 'var(--lp-muted)', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.4s' }} />
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSend} style={{ display: 'flex', borderTop: '1px solid var(--lp-border)', background: 'var(--lp-surface)', padding: '0.5rem' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message (e.g. price, port)..."
                className="input"
                style={{ flexGrow: 1, border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--lp-accent)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '0.35rem',
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Chat dots animations style */}
        <style>{`
          @keyframes chat-dot {
            0%, 100% { opacity: 0.3; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(-2px); }
          }
        `}</style>

      </div>
    </div>
  );
}
