import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, RefreshCw, Send, Check, Copy, ShieldAlert,
  Terminal, Globe, Zap, ArrowRight
} from 'lucide-react';

export default function WebhooksMarketingPage() {
  const [activeTab, setActiveTab] = useState<'node' | 'python' | 'php'>('node');
  const [selectedEvent, setSelectedEvent] = useState<'started' | 'answered' | 'recorded' | 'completed'>('started');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const eventPayloads = {
    started: {
      event: 'call.started',
      timestamp: 1789400000,
      data: {
        call_id: 'call_9a87d0f',
        direction: 'inbound',
        from: '+14155550100',
        to: '+18005550199',
        status: 'ringing'
      }
    },
    answered: {
      event: 'call.answered',
      timestamp: 1789400003,
      data: {
        call_id: 'call_9a87d0f',
        direction: 'inbound',
        from: '+14155550100',
        to: '+18005550199',
        status: 'in_progress',
        duration_so_far: 0
      }
    },
    recorded: {
      event: 'call.recorded',
      timestamp: 1789400030,
      data: {
        call_id: 'call_9a87d0f',
        recording_id: 'rec_982h1ba',
        audio_url: 'https://api.cloudpbx.com/v1/recordings/rec_982h1ba.mp3',
        duration_seconds: 27
      }
    },
    completed: {
      event: 'call.completed',
      timestamp: 1789400142,
      data: {
        call_id: 'call_9a87d0f',
        direction: 'inbound',
        from: '+14155550100',
        to: '+18005550199',
        status: 'completed',
        duration_seconds: 142,
        cost_usd: 0.355
      }
    }
  };

  const codeSnippets = {
    node: `// Node.js (Express example listener)
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify signatures to secure payload checks
const WEBHOOK_SECRET = 'cpbx_wh_sec_••••••••';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-cpbx-signature'];
  const payload = JSON.stringify(req.body);
  
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== hash) {
    return res.status(401).send('Invalid Signature');
  }

  const { event, data } = req.body;
  console.log(\`Received Webhook: \${event}\`, data);

  res.sendStatus(200);
});

app.listen(3000);`,
    python: `# Python (Flask example listener)
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = b'cpbx_wh_sec_\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022'

@app.route('/webhook', methods=['POST'])
def webhook_listener():
    signature = request.headers.get('X-CPBX-Signature')
    payload = request.data
    
    hash_val = hmac.new(WEBHOOK_SECRET, payload, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(signature, hash_val):
        return 'Unauthorized Signature', 401
        
    content = request.json
    print(f"Received Event: {content['event']}")
    
    return '', 200

if __name__ == '__main__':
    app.run(port=3000)`,
    php: `<?php
// PHP Webhook signature audit listener
$secret = 'cpbx_wh_sec_••••••••';

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_CPBX_SIGNATURE'] ?? '';

$hash = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($signature, $hash)) {
    http_response_code(401);
    exit('Invalid Signature verify.');
}

$data = json_decode($payload, true);
error_log("Webhook: " . $data['event']);

http_response_code(200);
?>`
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const activePayload = JSON.stringify(eventPayloads[selectedEvent], null, 2);

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Callback Events</span>
          <h2>Event-Driven Telemetry APIs</h2>
          <p>Get real-time webhook payloads pushed directly to your server endpoint whenever a call status changes.</p>
        </div>

        {/* Webhooks Config Board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--lp-shadow-card)',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Payload selector & details */}
          <div
            style={{
              padding: '2.5rem',
              borderRight: '1px solid var(--lp-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Webhook Trigger Events</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', lineHeight: 1.65 }}>
              Choose a specific event trigger type to inspect the JSON payload structure that our switch posts to your webhook target.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { id: 'started', label: 'call.started', desc: 'Call starts ringing' },
                { id: 'answered', label: 'call.answered', desc: 'Line connects' },
                { id: 'recorded', label: 'call.recorded', desc: 'Audio recording ready' },
                { id: 'completed', label: 'call.completed', desc: 'Call terminates' },
              ].map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev.id as any)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '12px',
                    background: selectedEvent === ev.id ? 'var(--lp-accent-dim)' : 'var(--lp-bg)',
                    border: `1.5px solid ${selectedEvent === ev.id ? 'var(--lp-accent)' : 'var(--lp-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedEvent === ev.id ? 'var(--lp-accent)' : 'var(--lp-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={12} />
                    {ev.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--lp-secondary)', marginTop: '0.25rem' }}>{ev.desc}</div>
                </button>
              ))}
            </div>

            {/* Signature Warning */}
            <div
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={18} style={{ color: 'var(--lp-warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text)' }}>Payload Auditing & Signature Security</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--lp-secondary)', lineHeight: 1.5, marginTop: '0.2rem' }}>
                  All post payloads include a HMAC SHA256 signature in the <code>X-CPBX-Signature</code> header generated using your secret. Verify signatures to reject spoof requests.
                </p>
              </div>
            </div>
          </div>

          {/* JSON Payload viewer (Right) */}
          <div
            style={{
              background: 'var(--lp-bg)',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-muted)' }}>PAYLOAD JSON</span>
              <button
                onClick={() => handleCopy(activePayload)}
                style={{ color: 'var(--lp-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}
              >
                {copiedText === activePayload ? <Check size={12} color="var(--lp-success)" /> : <Copy size={12} />}
                {copiedText === activePayload ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#38bdf8',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                borderRadius: '10px',
                padding: '1.25rem',
                flexGrow: 1,
                overflowX: 'auto',
                lineHeight: 1.5,
              }}
            >
              <code>{activePayload}</code>
            </pre>
          </div>
        </div>

        {/* Server Listener Code Snippets tabs */}
        <div
          style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '4rem',
            boxShadow: 'var(--lp-shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Webhook Server Setup Code</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', marginTop: '0.2rem' }}>
                Deploy verification hooks instantly in your preferred environment.
              </p>
            </div>

            {/* Language tabs */}
            <div style={{ display: 'flex', background: 'var(--lp-bg)', border: '1px solid var(--lp-border)', borderRadius: '10px', padding: '0.25rem' }}>
              {[
                { id: 'node', label: 'Node.js' },
                { id: 'python', label: 'Python' },
                { id: 'php', label: 'PHP' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveTab(lang.id as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: activeTab === lang.id ? 'var(--lp-accent)' : 'transparent',
                    color: activeTab === lang.id ? '#fff' : 'var(--lp-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Snippet box */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => handleCopy(codeSnippets[activeTab])}
              style={{
                position: 'absolute',
                top: '12px',
                right: '15px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--lp-border)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.72rem',
                color: 'var(--lp-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                zIndex: 2,
              }}
            >
              {copiedText === codeSnippets[activeTab] ? <Check size={12} color="var(--lp-success)" /> : <Copy size={12} />}
              {copiedText === codeSnippets[activeTab] ? 'Copied' : 'Copy Code'}
            </button>

            <pre
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#a5b4fc',
                background: 'var(--lp-bg)',
                border: '1px solid var(--lp-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}
            >
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>

        {/* Final layout */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verify live webhook responses on real numbers</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            Select local phone lines and map webhooks targets inside the Virtual Numbers console detail page.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="lp-btn-hero-primary">Start 14-day Free Trial</Link>
            <Link to="/api-docs" className="lp-btn-hero-ghost">Review API Reference</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
