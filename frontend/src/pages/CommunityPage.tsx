import { useState } from 'react';
import { MessageSquare, Eye, Search, Plus, X, Send, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ForumThread {
  id: string;
  title: string;
  category: 'general' | 'api' | 'ivr';
  replies: number;
  views: number;
  author: string;
  date: string;
  snippet: string;
}

const initialThreads: ForumThread[] = [
  {
    id: 'thread_1',
    title: 'How to route international inbound calls to a UK cell phone?',
    category: 'general',
    replies: 8,
    views: 142,
    author: 'dev_guy99',
    date: 'Just now',
    snippet: 'I provisioned a US toll-free number and I want to route all incoming calls directly to my UK mobile number without extra trunks. Is there a simple prefix format?'
  },
  {
    id: 'thread_2',
    title: 'Troubleshooting Express webhook signature comparisons',
    category: 'api',
    replies: 12,
    views: 284,
    author: 'telecom_coder',
    date: '2 hours ago',
    snippet: 'I am getting signature verification mismatch when parsing callbacks in my node server. I verified my secret token is correct. Any ideas on headers parsing?'
  },
  {
    id: 'thread_3',
    title: 'Best greeting templates for visual menu trees?',
    category: 'ivr',
    replies: 4,
    views: 95,
    author: 'biz_growth',
    date: '1 day ago',
    snippet: 'Looking for natural templates for greeting text-to-speech to prevent callers from hanging up inside the IVR menu layers. What options have worked best for you?'
  }
];

export default function CommunityPage() {
  const [threads, setThreads] = useState<ForumThread[]>(initialThreads);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'api' | 'ivr'>('all');
  
  // New thread modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'general' | 'api' | 'ivr'>('general');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      toast.error('Please enter a question title and details.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const addedThread: ForumThread = {
        id: `thread_${Date.now()}`,
        title: newTitle,
        category: newCategory,
        replies: 0,
        views: 1,
        author: 'Guest_User',
        date: 'Just now',
        snippet: newDesc
      };

      setThreads([addedThread, ...threads]);
      setSubmitting(false);
      setModalOpen(false);
      toast.success('Question posted to community boards!');
      
      // Clear fields
      setNewTitle('');
      setNewDesc('');
    }, 1000);
  };

  const filteredThreads = threads.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Community Forum</span>
          <h2>CloudPBX Discussions Board</h2>
          <p>Share call routing patterns, troubleshoot API payloads, or suggest product features with other developers.</p>
        </div>

        {/* Toolbar Controls */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Discussions' },
              { id: 'general', label: 'General PBX' },
              { id: 'api', label: 'API & Webhooks' },
              { id: 'ivr', label: 'IVR Configurations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  background: activeCategory === tab.id ? 'var(--lp-accent)' : 'rgba(255,255,255,0.03)',
                  color: activeCategory === tab.id ? '#fff' : 'var(--lp-secondary)',
                  border: `1px solid ${activeCategory === tab.id ? 'var(--lp-accent)' : 'var(--lp-border)'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%', maxWidth: '440px', justifyContent: 'flex-end' }}>
            {/* Search */}
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--lp-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search forum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{
                  paddingLeft: '38px',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  height: '38px',
                }}
              />
            </div>

            {/* Ask Question trigger */}
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', height: '38px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Ask Question
            </button>
          </div>
        </div>

        {/* Threads Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '4rem' }}>
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                style={{
                  background: 'var(--lp-surface)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '16px',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: 'var(--lp-accent-dim)',
                        color: 'var(--lp-accent)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '99px',
                      }}
                    >
                      {thread.category}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--lp-text)' }}>{thread.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
                    {thread.snippet}
                  </p>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--lp-muted)', display: 'flex', gap: '1.25rem', marginTop: '0.25rem' }}>
                    <span>Posted by: <strong>@{thread.author}</strong></span>
                    <span>{thread.date}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px' }}>
                    <MessageSquare size={16} style={{ color: 'var(--lp-secondary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>{thread.replies}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--lp-muted)' }}>replies</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px' }}>
                    <Eye size={16} style={{ color: 'var(--lp-secondary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>{thread.views}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--lp-muted)' }}>views</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--lp-muted)' }}>
              No discussions match your filter options. Start a new thread!
            </div>
          )}
        </div>

        {/* Create Thread Modal */}
        {modalOpen && (
          <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '540px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border-strong)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ask a Community Question</h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--lp-secondary)', cursor: 'pointer' }} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Question Summary *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input"
                    placeholder="e.g. How to forward SIP calls to specific voicemail box configurations?"
                  />
                </div>

                <div className="form-group">
                  <label>Category Topic</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="input"
                    style={{ appearance: 'auto', fontSize: '0.85rem' }}
                  >
                    <option value="general">General PBX Discussion</option>
                    <option value="api">REST API & Webhooks Telemetry</option>
                    <option value="ivr">IVR Builder Tree logic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Describe Question Details *</label>
                  <textarea
                    required
                    rows={5}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input"
                    placeholder="Provide details of what you are building, the logs or outputs, and where you are facing issues..."
                    style={{ resize: 'vertical' }}
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
                  <Send size={14} /> {submitting ? 'Posting question...' : 'Publish Question'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
