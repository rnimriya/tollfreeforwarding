import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Phone } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SmsLog {
  id: string;
  virtualNumberId: string;
  direction: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  status: string;
  createdAt: string;
  virtualNumber?: { e164Number: string; friendlyName: string };
}

interface VirtualNumber {
  id: string;
  e164Number: string;
  friendlyName: string;
}

export default function SmsPage() {
  const qc = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<{ numberId: string; contact: string } | null>(null);
  const [sendForm, setSendForm] = useState({ virtualNumberId: '', to: '', body: '' });
  const [showCompose, setShowCompose] = useState(false);

  const { data: smsData, isLoading } = useQuery<{ total: number; data: SmsLog[] }>({
    queryKey: ['sms'],
    queryFn: () => api.get('/sms?limit=100').then((r) => r.data),
    refetchInterval: 15_000,
  });

  const { data: numbers = [] } = useQuery<{ data: VirtualNumber[] }>({
    queryKey: ['numbers'],
    queryFn: () => api.get('/numbers').then((r) => r.data),
    select: (d) => d,
  });

  const threadQuery = useQuery<SmsLog[]>({
    queryKey: ['sms-thread', selectedThread?.numberId, selectedThread?.contact],
    queryFn: () =>
      api.get(`/sms/thread/${selectedThread!.numberId}/${encodeURIComponent(selectedThread!.contact)}`).then((r) => r.data),
    enabled: !!selectedThread,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => api.post('/sms/send', sendForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sms'] });
      qc.invalidateQueries({ queryKey: ['sms-thread'] });
      setSendForm((f) => ({ ...f, body: '' }));
      toast.success('SMS sent');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to send SMS'),
  });

  // Build conversation threads: group by (numberId, contact)
  const threads = Object.values(
    (smsData?.data || []).reduce((acc, msg) => {
      const contact = msg.direction === 'INBOUND' ? msg.fromNumber : msg.toNumber;
      const key = `${msg.virtualNumberId}::${contact}`;
      if (!acc[key]) acc[key] = { numberId: msg.virtualNumberId, contact, messages: [], lastMsg: msg };
      else if (new Date(msg.createdAt) > new Date(acc[key].lastMsg.createdAt)) acc[key].lastMsg = msg;
      acc[key].messages.push(msg);
      return acc;
    }, {} as Record<string, { numberId: string; contact: string; messages: SmsLog[]; lastMsg: SmsLog }>)
  ).sort((a, b) => new Date(b.lastMsg.createdAt).getTime() - new Date(a.lastMsg.createdAt).getTime());

  const vnMap = ((numbers as any)?.data || []).reduce((m: any, n: VirtualNumber) => { m[n.id] = n; return m; }, {} as Record<string, VirtualNumber>);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SMS Inbox</h1>
          <p className="page-subtitle">{smsData ? `${smsData.total} messages` : 'Send and receive SMS messages'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
          <Send size={15} /> Compose
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', height: 'calc(100vh - 180px)', minHeight: 400 }}>
        {/* Thread list */}
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          {isLoading ? (
            <div className="loading-page" style={{ height: 200 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
          ) : threads.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <MessageSquare size={32} />
              <p>No messages yet</p>
            </div>
          ) : (
            threads.map((t) => {
              const vn = vnMap[t.numberId];
              const isActive = selectedThread?.numberId === t.numberId && selectedThread?.contact === t.contact;
              return (
                <div
                  key={`${t.numberId}::${t.contact}`}
                  onClick={() => setSelectedThread({ numberId: t.numberId, contact: t.contact })}
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.contact}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{format(new Date(t.lastMsg.createdAt), 'MMM d')}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    via {vn?.e164Number || t.numberId}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.lastMsg.direction === 'OUTBOUND' ? '→ ' : ''}{t.lastMsg.body}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Thread view */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!selectedThread ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={36} />
              <p>Select a conversation to read it</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={16} color="var(--accent)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedThread.contact}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    via {vnMap[selectedThread.numberId]?.e164Number || selectedThread.numberId}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(threadQuery.data || []).map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: msg.direction === 'OUTBOUND' ? 'row-reverse' : 'row' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.5rem 0.875rem',
                      borderRadius: 16,
                      fontSize: '0.875rem',
                      background: msg.direction === 'OUTBOUND' ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: msg.direction === 'OUTBOUND' ? '#fff' : 'var(--text-primary)',
                    }}>
                      {msg.body}
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.2rem', textAlign: msg.direction === 'OUTBOUND' ? 'right' : 'left' }}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input"
                  placeholder="Type a message…"
                  value={sendForm.virtualNumberId === selectedThread.numberId ? sendForm.body : ''}
                  onChange={(e) => setSendForm({ virtualNumberId: selectedThread.numberId, to: selectedThread.contact, body: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter' && sendForm.body) sendMutation.mutate(); }}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  disabled={!sendForm.body || sendMutation.isPending}
                  onClick={() => sendMutation.mutate()}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-backdrop" onClick={() => setShowCompose(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Compose SMS</h2>
              <button className="btn btn-ghost" onClick={() => setShowCompose(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>From (Virtual Number)</label>
              <select className="input" value={sendForm.virtualNumberId} onChange={(e) => setSendForm((f) => ({ ...f, virtualNumberId: e.target.value }))}>
                <option value="">Select a number</option>
                {((numbers as any)?.data || []).map((n: VirtualNumber) => (
                  <option key={n.id} value={n.id}>{n.e164Number} — {n.friendlyName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To</label>
              <input className="input" placeholder="+1XXXXXXXXXX" value={sendForm.to} onChange={(e) => setSendForm((f) => ({ ...f, to: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="input" rows={4} value={sendForm.body} onChange={(e) => setSendForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowCompose(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!sendForm.virtualNumberId || !sendForm.to || !sendForm.body || sendMutation.isPending}
                onClick={() => { sendMutation.mutate(); setShowCompose(false); }}
              >
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
