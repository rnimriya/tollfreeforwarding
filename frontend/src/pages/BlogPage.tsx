import { useState } from 'react';
import { Search, Calendar, User, Clock, ArrowRight, X } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: 'product' | 'engineering' | 'guides';
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'post_1',
    title: 'Introducing the Visual IVR Builder V2',
    category: 'product',
    date: 'June 01, 2026',
    author: 'Aleksei Volkov',
    readTime: '4 min read',
    summary: 'Explore advanced drag-and-drop modules, time routing calendar rules, and custom voicemail notifications.',
    content: 'We are thrilled to launch the Visual IVR Builder V2. This release makes routing setup incredibly simple. You can configure complete interactive voice responses without typing lines of code. Key upgrades include:\n\n1. Custom Audio Greeting Text-To-Speech generation directly within block config pages.\n2. Day and hour filters to support custom calendar rules.\n3. Custom parameters that allow you to pass digits directly to endpoints.\n\nTo try out the builder, log in to your dashboard and navigate to any Virtual Number routing page.'
  },
  {
    id: 'post_2',
    title: 'Reducing SIP Trunk Call Latency Below 50ms',
    category: 'engineering',
    date: 'May 18, 2026',
    author: 'Helen Carter',
    readTime: '6 min read',
    summary: 'How we configured redundant media switching server POP endpoints to guarantee sub-50ms query handshakes.',
    content: 'In modern business voice systems, line latency is the core metric determining caller satisfaction. Any echo or delay above 150ms ruins natural conversations. We engineered a dual carrier resolution technique:\n\n- Regional Server Switching POPs: Pushing resolution code closer to call endpoints.\n- Dynamic Pathing: Monitoring packet drops across 12 global carriers and routing lines through optimal servers in real-time.\n\nThe resulting system achieves sub-50ms query resolution worldwide. For further details on our security configurations, visit the SLA page.'
  },
  {
    id: 'post_3',
    title: 'Standardizing API Key Signatures for Security',
    category: 'engineering',
    date: 'April 29, 2026',
    author: 'Helen Carter',
    readTime: '5 min read',
    summary: 'A step-by-step developer tutorial on auditing webhook signature callbacks using node and python keys.',
    content: 'Security is a non-negotiable metric. To protect developer endpoints, we have standardized HMAC-SHA256 signature verifications for all webhook operations. When a call event occurs, our switch triggers a post request containing the hash in the X-CPBX-Signature headers. Webhook listeners can compute the hash using their local secret token to audit the payload structure. Refer to the Webhooks page to review sample scripts in Express and Flask.'
  },
  {
    id: 'post_4',
    title: 'A Beginners Guide to Virtual Number Porting',
    category: 'guides',
    date: 'April 12, 2026',
    author: 'Sarah Jenkins',
    readTime: '3 min read',
    summary: 'Learn what documents and credentials you require to port local business lines into CloudPBX free of charge.',
    content: 'Porting your virtual lines does not need to be a confusing chore. Here are the items you need to provide to move existing lines:\n\n1. A Copy of your recent bill from your current provider showing the billing name and numbers.\n2. A Letter of Authorization (LOA) signed by the account owner.\n\nOnce submitted, the porting process takes between 5 to 7 days. Your numbers will remain active during the switch so you will experience zero downtime. Visit the Contact Us page to submit your details!'
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'product' | 'engineering' | 'guides'>('all');
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Company News</span>
          <h2>The CloudPBX Blog Hub</h2>
          <p>Read about product announcements, telemetry developer tutorials, engineering insights, and routing guides.</p>
        </div>

        {/* Toolbar Filters */}
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
              { id: 'all', label: 'All Articles' },
              { id: 'product', label: 'Product News' },
              { id: 'engineering', label: 'Engineering' },
              { id: 'guides', label: 'Guides & Help' },
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
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                paddingLeft: '38px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
              }}
            />
          </div>
        </div>

        {/* Blog Post List */}
        {filteredPosts.length > 0 ? (
          <div className="lp-features-grid" style={{ marginBottom: '4rem' }}>
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="lp-feature-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setViewingPost(post)}
              >
                <div>
                  {/* Category badge */}
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'var(--lp-accent-dim)',
                      color: 'var(--lp-accent)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '99px',
                      display: 'inline-block',
                      marginBottom: '1rem',
                    }}
                  >
                    {post.category}
                  </span>
                  
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    {post.title}
                  </h3>
                  
                  <p style={{ fontSize: '0.875rem', color: 'var(--lp-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {post.summary}
                  </p>
                </div>

                {/* Footer metadata */}
                <div
                  style={{
                    borderTop: '1px solid var(--lp-border)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--lp-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      <span>{post.readTime}</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--lp-accent)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--lp-muted)' }}>
            <p>No articles found matching "{searchQuery}".</p>
          </div>
        )}

        {/* Modal for viewing single article */}
        {viewingPost && (
          <div className="modal-backdrop" onClick={() => setViewingPost(null)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '640px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border-strong)',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'var(--lp-accent-dim)',
                      color: 'var(--lp-accent)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '99px',
                      marginBottom: '0.5rem',
                      display: 'inline-block',
                    }}
                  >
                    {viewingPost.category}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--lp-text)' }}>{viewingPost.title}</h3>
                </div>
                <button
                  onClick={() => setViewingPost(null)}
                  style={{
                    color: 'var(--lp-secondary)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                  aria-label="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Meta details */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--lp-secondary)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={13} />
                  <span>{viewingPost.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} />
                  <span>{viewingPost.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} />
                  <span>{viewingPost.readTime}</span>
                </div>
              </div>

              {/* Main content body */}
              <div
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--lp-text)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {viewingPost.content}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
