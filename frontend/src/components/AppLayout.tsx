import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Phone, List, Workflow, LogOut, Settings, Zap } from 'lucide-react';
import { useAuth } from '../stores/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/numbers', icon: Phone, label: 'Virtual Numbers' },
  { to: '/logs', icon: List, label: 'Call Logs' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📞</div>
          <div className="sidebar-logo-text">Cloud<span>PBX</span></div>
        </div>

        <div className="nav-section" style={{ flex: 1 }}>
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', marginBottom: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
              {user?.firstName?.[0] || user?.email?.[0] || '?'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-dim)', marginBottom: '0.5rem' }}>
            <Zap size={12} color="var(--accent)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.plan}</span>
          </div>

          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
