import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Plus, Trash2, Check, ArrowRight, Music,
  PhoneCall, Settings, Eye, HelpCircle, Layers, Volume2
} from 'lucide-react';

interface MockIVRNode {
  id: string;
  type: 'greeting' | 'menu' | 'forward' | 'voicemail';
  title: string;
  param: string; // text to speak, number to forward, etc.
  children: { [key: string]: string }; // trigger key -> child id
}

export default function IVRMarketingPage() {
  const [nodes, setNodes] = useState<MockIVRNode[]>([
    {
      id: 'root',
      type: 'greeting',
      title: 'Welcome Speech',
      param: 'Thank you for calling Acme, Corp. Please choose an option.',
      children: { 'next': 'menu_1' }
    },
    {
      id: 'menu_1',
      type: 'menu',
      title: 'Department Menu',
      param: '1 for Sales, 2 for Support, 3 for Voicemail.',
      children: { '1': 'forward_sales', '2': 'forward_support', '3': 'voicemail_box' }
    },
    {
      id: 'forward_sales',
      type: 'forward',
      title: 'Forward to Sales',
      param: '+1 (800) 555-0199',
      children: {}
    },
    {
      id: 'forward_support',
      type: 'forward',
      title: 'Forward to Support',
      param: '+1 (800) 555-0122',
      children: {}
    },
    {
      id: 'voicemail_box',
      type: 'voicemail',
      title: 'Leave Voicemail',
      param: 'Record greeting after the tone.',
      children: {}
    }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');
  const [simulating, setSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Helper to add nodes
  const addNode = (type: 'greeting' | 'menu' | 'forward' | 'voicemail') => {
    const newId = `node_${Date.now()}`;
    const titles = {
      greeting: 'Audio Greeting',
      menu: 'Keypress Menu',
      forward: 'Forward Line',
      voicemail: 'Voicemail Box'
    };
    const params = {
      greeting: 'Please enter a message to read...',
      menu: 'Press 1 for Sales, 2 for billing.',
      forward: '+1 (555) 000-0000',
      voicemail: 'Record message.'
    };

    const newNode: MockIVRNode = {
      id: newId,
      type,
      title: titles[type],
      param: params[type],
      children: {}
    };

    setNodes([...nodes, newNode]);
    setSelectedNodeId(newId);
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return; // Cannot delete starting greeting
    // Filter node
    setNodes(nodes.filter(n => n.id !== id).map(n => {
      // Clean links pointing to deleted node
      const updatedChildren = { ...n.children };
      Object.keys(updatedChildren).forEach(key => {
        if (updatedChildren[key] === id) {
          delete updatedChildren[key];
        }
      });
      return { ...n, children: updatedChildren };
    }));
    if (selectedNodeId === id) {
      setSelectedNodeId('root');
    }
  };

  const updateNodeParam = (id: string, paramVal: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, param: paramVal } : n));
  };

  const updateNodeTitle = (id: string, titleVal: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, title: titleVal } : n));
  };

  const connectNode = (parentId: string, triggerKey: string, targetId: string) => {
    setNodes(nodes.map(n => {
      if (n.id === parentId) {
        return {
          ...n,
          children: {
            ...n.children,
            [triggerKey]: targetId
          }
        };
      }
      return n;
    }));
  };

  const runSimulation = async () => {
    setSimulating(true);
    setSimulationLog(['Starting call routing simulation...', 'Dialing provisioned number +1 (800) CloudPBX...']);
    setCurrentNodeId('root');

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Greeting
    await sleep(1500);
    const rootNode = nodes.find(n => n.id === 'root');
    if (!rootNode) return;
    setSimulationLog(prev => [...prev, `[TTS Speak] Welcome Speech: "${rootNode.param}"`]);
    
    // Menu
    const nextId = rootNode.children['next'] || 'menu_1';
    setCurrentNodeId(nextId);
    await sleep(2000);
    const menuNode = nodes.find(n => n.id === nextId);
    if (!menuNode) {
      setSimulationLog(prev => [...prev, 'Disconnected: no connecting menu found.']);
      setSimulating(false);
      setCurrentNodeId(null);
      return;
    }
    setSimulationLog(prev => [...prev, `[IVR Attendant Menu]: "${menuNode.param}"`]);
    setSimulationLog(prev => [...prev, 'Simulating Dial-Pad key press: [Press 2 for Support]']);

    // Forwarding Support
    const supportId = menuNode.children['2'] || 'forward_support';
    setCurrentNodeId(supportId);
    await sleep(2000);
    const supportNode = nodes.find(n => n.id === supportId);
    if (!supportNode) {
      setSimulationLog(prev => [...prev, 'Disconnected: target node missing.']);
      setSimulating(false);
      setCurrentNodeId(null);
      return;
    }
    setSimulationLog(prev => [...prev, `[Forwarding Call] Routing line to support target: ${supportNode.param}`]);
    await sleep(1500);
    setSimulationLog(prev => [...prev, '☎️ Inbound call successfully answered by agent. Line connected!']);
    
    await sleep(1500);
    setSimulating(false);
    setCurrentNodeId(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="lp-section" style={{ padding: '4rem 0' }}>
      <div className="lp-container">

        {/* Header */}
        <div className="lp-section-header">
          <span className="lp-section-badge">Visual IVR Builder</span>
          <h2>Design Intelligent Dial flows Effortlessly</h2>
          <p>Guide callers to correct resources without coding. Use our interactive sandbox below to design and simulate a dial plan.</p>
        </div>

        {/* Sandbox Board Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '250px 1fr 300px',
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--lp-shadow-card)',
            minHeight: '520px',
            marginBottom: '4rem',
          }}
          className="lp-spotlight-inner"
        >
          {/* Node Palette Bar (Left) */}
          <div
            style={{
              padding: '1.5rem',
              borderRight: '1px solid var(--lp-border)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', color: 'var(--lp-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              IVR Building Blocks
            </h4>
            
            <button onClick={() => addNode('greeting')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <Volume2 size={16} style={{ color: '#6366f1' }} /> + Add Greeting
            </button>
            <button onClick={() => addNode('menu')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <Layers size={16} style={{ color: '#22c55e' }} /> + Add Keypress Menu
            </button>
            <button onClick={() => addNode('forward')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <PhoneCall size={16} style={{ color: '#38bdf8' }} /> + Add Forward Line
            </button>
            <button onClick={() => addNode('voicemail')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <Music size={16} style={{ color: '#a855f7' }} /> + Add Voicemail Box
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--lp-border)', margin: '1rem 0' }} />

            {/* Test Dial Sandbox Trigger */}
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                background: simulating ? 'var(--lp-muted)' : 'var(--lp-accent)',
              }}
            >
              <Play size={15} fill="white" /> {simulating ? 'Running...' : 'Simulate Call'}
            </button>

            {/* Simulator Live log */}
            {simulating && (
              <div
                style={{
                  background: 'var(--lp-bg)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#a5b4fc',
                  height: '150px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {simulationLog.map((log, lIdx) => (
                  <div key={lIdx}>{log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Canvas (Center) */}
          <div
            style={{
              padding: '2rem',
              background: 'var(--lp-bg)',
              position: 'relative',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                fontSize: '0.7rem',
                color: 'var(--lp-muted)',
                fontWeight: 600,
              }}
            >
              Interactive Canvas Playground
            </div>

            {/* Nodes Tree Render */}
            {nodes.map((node) => {
              const isActiveNode = currentNodeId === node.id;
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    background: 'var(--lp-surface)',
                    border: `2px solid ${
                      isActiveNode
                        ? 'var(--lp-success)'
                        : isSelected
                        ? 'var(--lp-accent)'
                        : 'var(--lp-border)'
                    }`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    width: '100%',
                    maxWidth: '320px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: isActiveNode
                      ? '0 0 20px rgba(34,197,94,0.3)'
                      : isSelected
                      ? '0 0 15px rgba(99,102,241,0.2)'
                      : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color:
                          node.type === 'greeting'
                            ? '#6366f1'
                            : node.type === 'menu'
                            ? '#22c55e'
                            : node.type === 'forward'
                            ? '#38bdf8'
                            : '#a855f7',
                      }}
                    >
                      {node.type}
                    </span>
                    {isActiveNode && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(34,197,94,0.15)',
                          color: 'var(--lp-success)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '99px',
                          fontWeight: 700,
                          animation: 'pulse-dot 2s infinite',
                        }}
                      >
                        Playing
                      </span>
                    )}
                  </div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--lp-text)' }}>{node.title}</h5>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--lp-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.2rem',
                    }}
                  >
                    {node.param}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Node Config Panel (Right) */}
          <div
            style={{
              padding: '1.5rem',
              borderLeft: '1px solid var(--lp-border)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Block Settings</h4>
                  {selectedNode.id !== 'root' && (
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      style={{ color: 'rgba(239,68,68,0.7)', cursor: 'pointer' }}
                      aria-label="Delete Block"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Title Name</label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => updateNodeTitle(selectedNode.id, e.target.value)}
                    className="input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                <div className="form-group">
                  <label>
                    {selectedNode.type === 'greeting' && 'Greeting Message (TTS)'}
                    {selectedNode.type === 'menu' && 'Menu Options Prompts'}
                    {selectedNode.type === 'forward' && 'Forward Target (E.164 Number)'}
                    {selectedNode.type === 'voicemail' && 'Voicemail Greeting Speech'}
                  </label>
                  <textarea
                    value={selectedNode.param}
                    onChange={(e) => updateNodeParam(selectedNode.id, e.target.value)}
                    className="input"
                    rows={4}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', resize: 'vertical' }}
                  />
                </div>

                {selectedNode.type === 'menu' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Routing Actions</label>
                    {['1', '2', '3'].map((key) => {
                      const targetId = selectedNode.children[key];
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>Key {key}:</span>
                          <select
                            value={targetId || ''}
                            onChange={(e) => connectNode(selectedNode.id, key, e.target.value)}
                            className="input"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', appearance: 'auto' }}
                          >
                            <option value="">-- select target block --</option>
                            {nodes
                              .filter((n) => n.id !== selectedNode.id && n.id !== 'root')
                              .map((n) => (
                                <option key={n.id} value={n.id}>
                                  {n.title}
                                </option>
                              ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--lp-muted)', padding: '2rem 0' }}>
                Select a block on the canvas to configure.
              </div>
            )}

            <div
              style={{
                borderTop: '1px solid var(--lp-border)',
                paddingTop: '1rem',
                fontSize: '0.72rem',
                color: 'var(--lp-secondary)',
                lineHeight: 1.5,
              }}
            >
              💡 Create menus by linking keypresses to Forward Lines or Voicemail Boxes. Run call simulation to audit paths.
            </div>
          </div>
        </div>

        {/* Feature breakdown cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            {
              title: 'Text-to-Speech Engine',
              desc: 'Select from 40+ lifelike voices in 24 languages. Input raw messages and let our generator speak with organic pronunciations.',
              tag: 'Core'
            },
            {
              title: 'DTMF Digit Gathering',
              desc: 'Record caller keyboard responses seamlessly. Route users accurately according to dial pad input trees.',
              tag: 'Interactive'
            },
            {
              title: 'Voicemail To Email',
              desc: 'Record inbound voicemail logs. Transcribe audio files automatically and email details immediately to your agents.',
              tag: 'Automation'
            }
          ].map((item, idx) => (
            <div key={idx} className="lp-feature-card">
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
                {item.tag}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--lp-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Final callout */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.08))',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Visual IVR Builder is standard in Professional</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lp-secondary)', maxWidth: '580px' }}>
              Build, schedule, track, and optimize caller flows. Standard configuration takes less than 3 minutes.
            </p>
          </div>
          <Link to="/register" className="lp-btn-primary">
            Try Attendant Free <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
