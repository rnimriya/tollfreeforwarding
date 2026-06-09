import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Send, Check, Heart, Smile, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface JobPosition {
  id: string;
  title: string;
  department: 'engineering' | 'support' | 'sales' | 'marketing';
  location: string;
  compensation: string;
  desc: string;
  requirements: string[];
}

const jobsList: JobPosition[] = [
  {
    id: 'job_1',
    title: 'Senior Low-Latency Systems Engineer',
    department: 'engineering',
    location: 'Remote (Global)',
    compensation: '$140K – $175K + Equity',
    desc: 'Work on our core media routing switch engine to optimize SIP trunks and DTMF audio parsing paths.',
    requirements: [
      '5+ years writing systems software using Rust, Go, or C++.',
      'Deep knowledge of TCP/IP networking, SIP, RTP, and WebRTC protocols.',
      'Experience optimizing Linux kernel packet handling operations.'
    ]
  },
  {
    id: 'job_2',
    title: 'Frontend engineer (React / TypeScript)',
    department: 'engineering',
    location: 'Remote (US/EU)',
    compensation: '$100K – $130K',
    desc: 'Build highly interactive configurations dashboards, visual graph builders, and developer API references.',
    requirements: [
      '3+ years writing robust TS and React application codes.',
      'Experience building canvas interfaces or nodes charts engines (e.g. React Flow).',
      'Strong eye for aesthetics, glassmorphic layout CSS tokens, and theme configs.'
    ]
  },
  {
    id: 'job_3',
    title: 'Carrier Operations Specialist',
    department: 'support',
    location: 'London, UK (Hybrid)',
    compensation: '£55K – £70K',
    desc: 'Coordinate with global telecom providers to secure number inventory and facilitate client porting requests.',
    requirements: [
      '3+ years managing trunk registrations with national telecom vendors.',
      'Familiarity with FCC/Ofcom legal compliance guidelines for porting.',
      'Tenacious problem-solver who can expedite port clearances.'
    ]
  },
  {
    id: 'job_4',
    title: 'Enterprise Technical Account Lead',
    department: 'sales',
    location: 'Remote (Global)',
    compensation: '$85K + Commission OTE ($130K)',
    desc: 'Help large customer networks integrate our REST APIs and map customized SIP nodes infrastructure.',
    requirements: [
      '2+ years working inside customer engineering pre-sales support teams.',
      'Familiarity reading API curl references and webhook post logs.',
      'Clear, confident communication style for client consulting.'
    ]
  }
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<'all' | 'engineering' | 'support' | 'sales' | 'marketing'>('all');
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

  // Application form state
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candResume, setCandResume] = useState('');
  const [candCover, setCandCover] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredJobs = jobsList.filter((j) => selectedDept === 'all' || j.department === selectedDept);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candEmail || !candResume) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Application submitted successfully! Our team will get back to you shortly.');
      // Clear fields and close
      setCandName('');
      setCandEmail('');
      setCandResume('');
      setCandCover('');
      setSelectedJob(null);
    }, 1200);
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">We are Hiring</span>
          <h2>Build the Future of Cloud PBX</h2>
          <p>Join a fully-remote, distributed team working to redefine global voice communications. Check out our open roles below.</p>
        </div>

        {/* Benefits Perks grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            { title: 'Work From Anywhere', desc: 'Our team is distributed across 8 countries. Set your hours and work from wherever you feel most creative.', icon: Smile },
            { title: 'Health & Wellness', desc: 'Premium medical coverage, fitness budgets, and mental health check support programs standard.', icon: Heart },
            { title: 'Growth & Equipment', desc: 'Get a top-spec laptop, ergonomic workspace setup budget, and annual books/education allowance.', icon: Sparkles }
          ].map((perk, idx) => {
            const IconComp = perk.icon;
            return (
              <div key={idx} className="lp-feature-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--lp-accent-dim)', color: 'var(--lp-accent)', padding: '0.65rem', borderRadius: '12px', flexShrink: 0 }}>
                  <IconComp size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{perk.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters Toolbar */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'all', label: 'All Openings' },
              { id: 'engineering', label: 'Engineering' },
              { id: 'support', label: 'Operations & Support' },
              { id: 'sales', label: 'Sales & Success' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDept(tab.id as any)}
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '99px',
                  background: selectedDept === tab.id ? 'var(--lp-accent)' : 'transparent',
                  color: selectedDept === tab.id ? '#fff' : 'var(--lp-secondary)',
                  border: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '4rem' }}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: 'var(--lp-surface)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '16px',
                  padding: '1.75rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  transition: 'border-color 0.15s',
                  cursor: 'pointer',
                }}
                className="number-card"
                onClick={() => setSelectedJob(job)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--lp-text)' }}>{job.title}</h3>
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
                      {job.department}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5, maxWidth: '650px' }}>
                    {job.desc}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--lp-muted)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <DollarSign size={12} /> {job.compensation}
                    </span>
                  </div>
                </div>

                <button className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                  Apply Position
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--lp-muted)' }}>
              No openings listed for this department currently. Check back later!
            </div>
          )}
        </div>

        {/* Application Modal */}
        {selectedJob && (
          <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '560px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border-strong)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid var(--lp-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Apply: {selectedJob.title}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lp-accent)', fontWeight: 600, marginTop: '0.25rem' }}>
                    {selectedJob.location} • {selectedJob.compensation}
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} style={{ color: 'var(--lp-secondary)', cursor: 'pointer' }} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

              {/* Requirements summary info */}
              <div style={{ background: 'var(--lp-bg)', border: '1px solid var(--lp-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--lp-muted)', marginBottom: '0.5rem' }}>
                  Role Requirements
                </h5>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedJob.requirements.map((req, rIdx) => (
                    <li key={rIdx} style={{ fontSize: '0.75rem', color: 'var(--lp-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                      <Check size={12} style={{ color: 'var(--lp-success)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form elements */}
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="input"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="input"
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="form-group">
                  <label>Resume / CV Link or Text *</label>
                  <textarea
                    required
                    rows={4}
                    value={candResume}
                    onChange={(e) => setCandResume(e.target.value)}
                    className="input"
                    placeholder="Paste a link to your LinkedIn profile/PDF resume, or paste raw text copy..."
                  />
                </div>

                <div className="form-group">
                  <label>Cover Letter (Optional)</label>
                  <textarea
                    rows={3}
                    value={candCover}
                    onChange={(e) => setCandCover(e.target.value)}
                    className="input"
                    placeholder="Tell us why you are interested in joining CloudPBX..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '1rem',
                    background: submitting ? 'var(--lp-muted)' : 'var(--lp-accent)',
                  }}
                >
                  <Send size={14} /> {submitting ? 'Sending details...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
