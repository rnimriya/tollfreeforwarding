import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Copy, Check, FileCode, Terminal, Key, Shield } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  desc: string;
  headers: { [key: string]: string };
  payload?: string;
  response: string;
}

export default function APIDocsPage() {
  const [activeSection, setActiveSection] = useState<'auth' | 'numbers' | 'ivr' | 'logs'>('auth');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive console state
  const [consoleEndpoint, setConsoleEndpoint] = useState<string>('GET /v1/numbers');
  const [consoleResult, setConsoleResult] = useState<string | null>(null);
  const [consoleLoading, setConsoleLoading] = useState(false);

  const sections = {
    auth: {
      title: 'Authentication',
      desc: 'All API requests must contain your API Key in the authorization headers. You can generate API Keys inside the Settings console of your Dashboard.',
      endpoint: {
        method: 'GET' as const,
        path: '/v1/auth/verify',
        desc: 'Verify that your API keys are active and configured with read/write permissions.',
        headers: {
          'Authorization': 'Bearer cpbx_live_key_••••••••',
          'Accept': 'application/json'
        },
        response: JSON.stringify({
          status: 'success',
          authenticated: true,
          scope: ['read_numbers', 'write_routing', 'read_logs'],
          account_id: 'acc_7190ad0f9'
        }, null, 2)
      }
    },
    numbers: {
      title: 'Virtual Numbers API',
      desc: 'Retrieve, register, or delete virtual numbers inside your account programmatically.',
      endpoint: {
        method: 'GET' as const,
        path: '/v1/numbers',
        desc: 'Fetch a list of all virtual numbers configured inside your business subscription.',
        headers: {
          'Authorization': 'Bearer cpbx_live_key_••••••••',
        },
        response: JSON.stringify({
          object: 'list',
          data: [
            {
              id: 'num_01h2a89c',
              number: '+18005550199',
              friendly_name: 'Sales Hotline',
              country: 'US',
              status: 'active',
              routing_type: 'ivr',
              routing_target_id: 'ivr_flow_90a',
              created_at: 1789028000
            },
            {
              id: 'num_01h2a90f',
              number: '+442071234567',
              friendly_name: 'London Office',
              country: 'GB',
              status: 'active',
              routing_type: 'forward',
              routing_target_id: '+447911123456',
              created_at: 1789115000
            }
          ],
          total_count: 2
        }, null, 2)
      }
    },
    ivr: {
      title: 'Call Routing IVR API',
      desc: 'Trigger modifications to IVR node rules and publish flows programmatically.',
      endpoint: {
        method: 'POST' as const,
        path: '/v1/ivr/flows',
        desc: 'Create or update a custom routing flow node structure.',
        headers: {
          'Authorization': 'Bearer cpbx_live_key_••••••••',
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          name: 'Support Menu Flow',
          nodes: [
            { id: 'start', type: 'greeting', param: 'Thank you for calling support.' },
            { id: 'forward', type: 'forward', param: '+18005550122' }
          ]
        }, null, 2),
        response: JSON.stringify({
          id: 'ivr_flow_90a',
          name: 'Support Menu Flow',
          version: 2,
          published: true,
          created_at: 1789230000,
          updated_at: 1789316400
        }, null, 2)
      }
    },
    logs: {
      title: 'Call Logs API',
      desc: 'Query detailed Call Detail Records (CDR) history with custom offsets.',
      endpoint: {
        method: 'GET' as const,
        path: '/v1/logs?limit=10',
        desc: 'List historical call detail logs.',
        headers: {
          'Authorization': 'Bearer cpbx_live_key_••••••••',
        },
        response: JSON.stringify({
          object: 'list',
          data: [
            {
              id: 'log_9a87d0f',
              direction: 'inbound',
              from: '+14155550100',
              to: '+18005550199',
              status: 'completed',
              duration_seconds: 142,
              cost_usd: 0.355,
              timestamp: 1789400000
            }
          ],
          has_more: false
        }, null, 2)
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const activeData = sections[activeSection];

  const handleConsoleSend = () => {
    setConsoleLoading(true);
    setConsoleResult(null);

    setTimeout(() => {
      setConsoleLoading(false);
      if (consoleEndpoint === 'GET /v1/numbers') {
        setConsoleResult(sections.numbers.endpoint.response);
      } else if (consoleEndpoint === 'GET /v1/logs?limit=10') {
        setConsoleResult(sections.logs.endpoint.response);
      } else if (consoleEndpoint === 'GET /v1/auth/verify') {
        setConsoleResult(sections.auth.endpoint.response);
      } else {
        setConsoleResult(JSON.stringify({ error: 'Endpoint not simulated in sandbox playground.' }, null, 2));
      }
    }, 800);
  };

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Developers Console</span>
          <h2>CloudPBX REST API Engine</h2>
          <p>Integrate virtual lines, call detail routing records, and webhook telemetry into your corporate apps inside minutes.</p>
        </div>

        {/* Dual Pane Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr 1fr',
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--lp-shadow-card)',
            minHeight: '600px',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Sidebar Menu (Left) */}
          <div
            style={{
              padding: '1.5rem',
              borderRight: '1px solid var(--lp-border)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <h4 style={{ fontSize: '0.75rem', color: 'var(--lp-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Reference Topics
            </h4>

            {[
              { id: 'auth', label: 'Authentication', icon: Key },
              { id: 'numbers', label: 'Virtual Numbers', icon: FileCode },
              { id: 'ivr', label: 'Visual IVR Routing', icon: Terminal },
              { id: 'logs', label: 'Call Detail Logs', icon: Shield },
            ].map((sec) => {
              const IconComp = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: activeSection === sec.id ? 'var(--lp-accent-dim)' : 'transparent',
                    color: activeSection === sec.id ? 'var(--lp-accent)' : 'var(--lp-secondary)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <IconComp size={15} />
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Docs Description (Center Pane) */}
          <div
            style={{
              padding: '2rem',
              overflowY: 'auto',
              borderRight: '1px solid var(--lp-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeData.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', lineHeight: 1.65 }}>
              {activeData.desc}
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--lp-border)' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: activeData.endpoint.method === 'GET' ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)',
                    color: activeData.endpoint.method === 'GET' ? 'var(--lp-success)' : 'var(--lp-accent)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  {activeData.endpoint.method}
                </span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  {activeData.endpoint.path}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.5 }}>
                {activeData.endpoint.desc}
              </p>
            </div>

            {/* Request Headers parameters */}
            <div>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--lp-muted)', marginBottom: '0.5rem' }}>
                Required Headers
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Object.entries(activeData.endpoint.headers).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--lp-border)', paddingBottom: '0.35rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--lp-secondary)' }}>{key}</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--lp-muted)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Code Block (Right Pane) */}
          <div
            style={{
              background: 'var(--lp-bg)',
              padding: '2rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--lp-muted)', letterSpacing: '0.05em' }}>
                SAMPLE RESPONSE
              </span>
              <button
                onClick={() => handleCopy(activeData.endpoint.response)}
                style={{ color: 'var(--lp-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}
              >
                {copiedText === activeData.endpoint.response ? <Check size={12} color="var(--lp-success)" /> : <Copy size={12} />}
                {copiedText === activeData.endpoint.response ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#818cf8',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                borderRadius: '10px',
                padding: '1.25rem',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}
            >
              <code>{activeData.endpoint.response}</code>
            </pre>
          </div>
        </div>

        {/* Developer Sandbox Playground Section */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '4rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Interactive REST API Playground</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)' }}>
              Choose a mock query endpoint and click Send to audit the live server response payload structures.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
            }}
            className="lp-spotlight-inner"
          >
            {/* Left selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
              <div className="form-group">
                <label>Select API Endpoint</label>
                <select
                  value={consoleEndpoint}
                  onChange={(e) => setConsoleEndpoint(e.target.value)}
                  className="input"
                  style={{ appearance: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="GET /v1/auth/verify">GET /v1/auth/verify</option>
                  <option value="GET /v1/numbers">GET /v1/numbers</option>
                  <option value="GET /v1/logs?limit=10">GET /v1/logs?limit=10</option>
                </select>
              </div>

              <button
                onClick={handleConsoleSend}
                disabled={consoleLoading}
                className="btn btn-primary"
                style={{
                  justifyContent: 'center',
                  background: consoleLoading ? 'var(--lp-muted)' : 'var(--lp-accent)',
                }}
              >
                {consoleLoading ? 'Connecting...' : 'Execute Request'}
              </button>
            </div>

            {/* Right Output */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-muted)', display: 'block', marginBottom: '0.5rem' }}>
                CONSOLE OUTPUT
              </span>
              <div
                style={{
                  background: 'var(--lp-bg)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  minHeight: '220px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: consoleResult ? '#86efac' : 'var(--lp-muted)',
                  overflowX: 'auto',
                }}
              >
                {consoleLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--lp-accent)' }}>
                    <div className="spinner" style={{ width: '15px', height: '15px' }} /> Performing query handshakes...
                  </div>
                ) : consoleResult ? (
                  <pre><code>{consoleResult}</code></pre>
                ) : (
                  <div>Choose an endpoint and click execute to query parameters.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Developer CTA final info */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Want full webhook and SDK integrations?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            Check out our webhook specifications and read listener structures built in popular server environments.
          </p>
          <Link to="/webhooks" className="lp-btn-primary">
            Explore Webhooks Configuration
          </Link>
        </div>

      </div>
    </div>
  );
}
