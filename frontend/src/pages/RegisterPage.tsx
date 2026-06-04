import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📞</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>CloudPBX</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Virtual Number Platform</div>
          </div>
        </div>

        <h2 style={{ marginBottom: '0.5rem' }}>Create your account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Get your first virtual number in under 2 minutes.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First name</label>
              <input className="input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required placeholder="Jane" />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input className="input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required placeholder="Smith" />
            </div>
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="jane@company.com" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required placeholder="••••••••" minLength={8} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
