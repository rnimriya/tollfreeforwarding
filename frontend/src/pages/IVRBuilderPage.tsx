import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, Panel, Handle, Position,
  type Node, type Edge, type Connection, BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Plus, Mic, Menu, GitBranch, PhoneForwarded, Voicemail, PhoneOff, X, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { useTheme } from '../stores/themeStore';

// ─── Node type config ──────────────────────────────────────────────────────────
const NODE_TYPES_CONFIG = [
  { type: 'greeting',  icon: Mic,            label: 'Greeting',  color: '#6366f1', desc: 'Play audio or TTS' },
  { type: 'menu',      icon: Menu,           label: 'IVR Menu',  color: '#22c55e', desc: 'DTMF digit menu' },
  { type: 'condition', icon: GitBranch,      label: 'Condition', color: '#f59e0b', desc: 'Time/Caller ID check' },
  { type: 'forward',   icon: PhoneForwarded, label: 'Forward',   color: '#38bdf8', desc: 'Route to number' },
  { type: 'voicemail', icon: Voicemail,      label: 'Voicemail', color: '#a855f7', desc: 'Record message' },
  { type: 'hangup',    icon: PhoneOff,       label: 'Hang Up',   color: '#ef4444', desc: 'End the call' },
] as const;

type NodeKind = typeof NODE_TYPES_CONFIG[number]['type'];

// ─── Custom IVR node component ─────────────────────────────────────────────────
function IVRNode({ data, selected }: { data: any; selected: boolean }) {
  const cfg = NODE_TYPES_CONFIG.find((n) => n.type === data.kind)!;
  const Icon = cfg?.icon || Mic;

  return (
    <div
      className={`ivr-node-wrapper${selected ? ' selected' : ''}`}
      style={{ borderColor: selected ? cfg?.color : undefined, minWidth: 160 }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--border-strong)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${cfg?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={cfg?.color} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.label}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cfg?.label}</div>
        </div>
      </div>

      {data.prompt && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '0.3rem 0.5rem', borderRadius: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          "{data.prompt}"
        </div>
      )}
      {data.value && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>{data.value}</div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--border-strong)', border: '2px solid var(--bg-elevated)', width: 10, height: 10 }} />
    </div>
  );
}

const nodeTypes = { ivr: IVRNode };

// ─── Config panel for selected node ────────────────────────────────────────────
function NodeConfigPanel({ node, onChange, onDelete }: { node: Node; onChange: (id: string, data: any) => void; onDelete: (id: string) => void }) {
  const data = node.data as any;
  const kind: NodeKind = data.kind;
  const cfg = NODE_TYPES_CONFIG.find((n) => n.type === kind)!;

  const update = (key: string, value: any) => onChange(node.id, { ...data, [key]: value });

  return (
    <div className="ivr-config">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: `${cfg?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cfg && <cfg.icon size={14} color={cfg.color} />}
          </div>
          <h3>{cfg?.label} Config</h3>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(node.id)} style={{ color: 'var(--danger)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="form-group">
        <label>Node Label</label>
        <input className="input" value={data.label} onChange={(e) => update('label', e.target.value)} />
      </div>

      {(kind === 'greeting' || kind === 'menu' || kind === 'voicemail') && (
        <div className="form-group">
          <label>{kind === 'menu' ? 'Menu Prompt' : 'Message / Prompt'}</label>
          <textarea className="input" rows={3} style={{ resize: 'vertical' }} value={data.prompt || ''} onChange={(e) => update('prompt', e.target.value)} placeholder="e.g. Thank you for calling. Press 1 for Sales." />
        </div>
      )}

      {kind === 'menu' && (
        <div className="form-group">
          <label>DTMF Timeout (s)</label>
          <input className="input" type="number" min={2} max={30} value={data.timeout || 5} onChange={(e) => update('timeout', Number(e.target.value))} />
        </div>
      )}

      {kind === 'forward' && (
        <>
          <div className="form-group">
            <label>Forward To</label>
            <input className="input" placeholder="+15550001234 or sip:user@domain" value={data.value || ''} onChange={(e) => update('value', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ring Timeout (s)</label>
            <input className="input" type="number" min={5} max={120} value={data.ringTimeout || 30} onChange={(e) => update('ringTimeout', Number(e.target.value))} />
          </div>
        </>
      )}

      {kind === 'condition' && (
        <div className="form-group">
          <label>Condition Type</label>
          <select className="input" value={data.conditionType || 'time_of_day'} onChange={(e) => update('conditionType', e.target.value)}>
            <option value="time_of_day">Time of Day</option>
            <option value="caller_id">Caller ID Match</option>
            <option value="day_of_week">Day of Week</option>
          </select>
        </div>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          💡 Connect nodes by dragging from the bottom handle to the top handle of another node.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IVRBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { data: vn } = useQuery({
    queryKey: ['number', id],
    queryFn: () => api.get(`/numbers/${id}`).then((r) => r.data),
  });

  // useNodesState/useEdgesState only consume their argument once (like useState).
  // vn loads asynchronously, so we start with a placeholder and sync via useEffect.
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'root',
      type: 'ivr',
      position: { x: 250, y: 80 },
      data: { kind: 'greeting', label: 'Welcome', prompt: 'Thank you for calling. How can we help you?' },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Tracks whether we have already seeded from the server — prevents overwriting
  // the user's in-progress edits if the query re-fetches.
  const flowSeededRef = useRef(false);

  useEffect(() => {
    if (!vn || flowSeededRef.current) return;
    flowSeededRef.current = true;

    if (vn.ivrFlow) {
      try {
        const flow = JSON.parse(vn.ivrFlow);
        if (flow?.nodes?.length) {
          setNodes(flow.nodes);
          setEdges(flow.edges ?? []);
        }
      } catch {
        console.error('[IVR] Saved flow is corrupted — starting fresh');
      }
    }
    setIsDirty(false);
  }, [vn, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } }, eds));
    setIsDirty(true);
  }, [setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n));
    setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: newData } : prev);
    setIsDirty(true);
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setIsDirty(true);
  }, [setNodes, setEdges]);

  const addNode = useCallback((kind: NodeKind) => {
    const cfg = NODE_TYPES_CONFIG.find((n) => n.type === kind)!;
    const newNode = {
      id: uuid(),
      type: 'ivr' as const,
      position: { x: 100 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data: { kind, label: cfg.label, prompt: '', value: '' },
    };
    setNodes((nds) => [...nds, newNode]);
    setIsDirty(true);
  }, [setNodes]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch(`/numbers/${id}`, {
        ivrEnabled: true,
        ivrFlow: { version: '1.0', nodes, edges, root: nodes[0]?.id },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['number', id] });
      setIsDirty(false);
      toast.success('IVR flow saved!');
    },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/numbers/${id}`)}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div>
            <span style={{ fontWeight: 700 }}>Visual IVR Builder</span>
            {vn && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{vn.e164Number}</span>}
          </div>
          {isDirty && <span className="badge badge-warning">Unsaved</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isDirty}>
            {saveMutation.isPending ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Save size={13} />}
            Save Flow
          </button>
        </div>
      </div>

      <div className="ivr-builder">
        {/* Palette */}
        <div className="ivr-palette">
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Node Types
          </p>
          {NODE_TYPES_CONFIG.map(({ type, icon: Icon, label, color, desc }) => (
            <div
              key={type}
              className="palette-node"
              draggable
              onClick={() => addNode(type)}
              title={desc}
            >
              <div style={{ width: 24, height: 24, borderRadius: 5, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{label}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click a node to add it to the canvas. Drag from the bottom handle to connect nodes.
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="ivr-canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => { onNodesChange(changes); setIsDirty(true); }}
            onEdgesChange={(changes) => { onEdgesChange(changes); setIsDirty(true); }}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)'} />
            <Controls />
            <MiniMap
              nodeColor={(n: Node) => {
                const kind = (n.data as any)?.kind as NodeKind;
                return NODE_TYPES_CONFIG.find((c) => c.type === kind)?.color || '#64748b';
              }}
              style={{ background: 'var(--bg-surface)' }}
            />
            <Panel position="top-right">
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={12} color="var(--success)" />
                {nodes.length} nodes · {edges.length} connections
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Config panel */}
        {selectedNode ? (
          <NodeConfigPanel
            node={selectedNode}
            onChange={updateNodeData}
            onDelete={deleteNode}
          />
        ) : (
          <div className="ivr-config" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '0.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🖱️</div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No node selected</p>
              <p style={{ fontSize: '0.8rem' }}>Click a node to configure it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
