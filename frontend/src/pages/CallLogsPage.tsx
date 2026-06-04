import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Clock, RefreshCw, Zap } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'success', NO_ANSWER: 'warning', VOICEMAIL: 'accent',
  FAILED: 'danger', INITIATED: 'info', IN_PROGRESS: 'info',
};

function fmtDuration(s: number | null) {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function CallLogsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['logs', page],
    queryFn: () => api.get(`/logs?page=${page}&limit=20`).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const simulateMutation = useMutation({
    mutationFn: () => api.post('/logs/simulate', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Simulated call log created!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Simulation failed'),
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <p className="page-subtitle">{total.toLocaleString()} total calls recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => qc.invalidateQueries({ queryKey: ['logs'] })} disabled={isFetching}>
            <RefreshCw size={13} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>
            <Zap size={13} /> Simulate Call
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-page" style={{ height: 300 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <Phone size={48} />
          <h3>No call logs yet</h3>
          <p>Calls will appear here. Use the Simulate button to generate test data.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>
            <Zap size={14} /> Simulate Call
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Forwarded</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>{log.callerNumber}</td>
                    <td>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>{log.calledNumber}</div>
                      {log.virtualNumber?.friendlyName && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.virtualNumber.friendlyName}</div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {log.forwardedTo || '-'}
                    </td>
                    <td><span className={`badge badge-${STATUS_CLASS[log.status] || 'muted'}`}>{log.status.replace('_', ' ')}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} color="var(--text-muted)" />
                        {fmtDuration(log.duration)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {format(new Date(log.startedAt), 'MMM d, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
