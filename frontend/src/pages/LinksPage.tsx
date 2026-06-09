import { Link } from 'react-router-dom';
import { useTheme } from '../stores/themeStore';
import {
  Sun,
  Moon,
  Home,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldAlert,
  LayoutDashboard,
  Phone,
  Settings,
  History,
  FileCode,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface RouteLink {
  title: string;
  path: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'public' | 'auth' | 'app';
  requiresAuth: boolean;
}

export default function LinksPage() {
  const { theme, toggleTheme } = useTheme();

  const routes: RouteLink[] = [
    {
      title: 'Landing Page',
      path: '/',
      description: 'The interactive homepage showcasing platform features, plans, and contact choices.',
      icon: Home,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Features Overview',
      path: '/features',
      description: 'Details our suite of virtual lines routing features and client capabilities.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Plans & Pricing',
      path: '/pricing',
      description: 'Plan tier pricing cards, FAQ accordion, and an interactive Slider Calculator.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Visual IVR Spotlight',
      path: '/ivr',
      description: 'Interactive mock IVR sandbox playground.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Dashboard Analytics',
      path: '/analytics',
      description: 'Interactive analytics reports showing statistics and load graphs.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Developer API Docs',
      path: '/api-docs',
      description: 'Dual-pane API documentation hub with a query console playground.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Webhook Callbacks',
      path: '/webhooks',
      description: 'Webhook verification code snippets and post payload templates.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Our Story (About)',
      path: '/about',
      description: 'Read about our company vision, timeline milestones, and team directory.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Company Blog',
      path: '/blog',
      description: 'Grid list of engineering articles, product updates, and search options.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Careers / Openings',
      path: '/careers',
      description: 'We are hiring: view roles, perks, and apply using our form.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Corporate Press Kit',
      path: '/press-kit',
      description: 'Download logos and assets packages, media guides, and headlines feed.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Partners & Affiliates',
      path: '/affiliates',
      description: 'Join our referral network: calculate commissions and apply online.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Help Center Docs',
      path: '/docs',
      description: 'Step-by-step guides categorized under configuration, porting, and APIs.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Uptime Status Page',
      path: '/status',
      description: 'Live monitor displaying components operational logs and outage reports.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Get Support (Contact)',
      path: '/contact',
      description: 'Submit ticket forms or try our interactive floating chat widget.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Community Forum',
      path: '/community',
      description: 'Q&A forums: discuss routing features and submit custom developer questions.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'SLA Commitments',
      path: '/sla',
      description: 'Service level agreement details, response commitments, and credit matrices.',
      icon: ExternalLink,
      category: 'public',
      requiresAuth: false,
    },
    {
      title: 'Login Page',
      path: '/login',
      description: 'The authentication portal to access your virtual phone number management system.',
      icon: LogIn,
      category: 'auth',
      requiresAuth: false,
    },
    {
      title: 'Register Page',
      path: '/register',
      description: 'Sign up page for new users to register and provision phone numbers.',
      icon: UserPlus,
      category: 'auth',
      requiresAuth: false,
    },
    {
      title: 'Forgot Password',
      path: '/forgot-password',
      description: 'Interface to request a password reset email link for registered accounts.',
      icon: KeyRound,
      category: 'auth',
      requiresAuth: false,
    },
    {
      title: 'Reset Password',
      path: '/reset-password',
      description: 'Form page where users can input their new password securely.',
      icon: ShieldAlert,
      category: 'auth',
      requiresAuth: false,
    },
    {
      title: 'Dashboard Overview',
      path: '/dashboard',
      description: 'Main user workspace dashboard displaying real-time usage stats and summaries.',
      icon: LayoutDashboard,
      category: 'app',
      requiresAuth: true,
    },
    {
      title: 'Virtual Numbers',
      path: '/numbers',
      description: 'List and search your provisioned toll-free numbers and active routings.',
      icon: Phone,
      category: 'app',
      requiresAuth: true,
    },
    {
      title: 'Number Details',
      path: '/numbers/1',
      description: 'Inspect details of a specific number, configure webhooks, and start building.',
      icon: Settings,
      category: 'app',
      requiresAuth: true,
    },
    {
      title: 'Visual IVR Builder',
      path: '/numbers/1/ivr',
      description: 'Drag-and-drop design tool to build call routing menus and automated responses.',
      icon: FileCode,
      category: 'app',
      requiresAuth: true,
    },
    {
      title: 'Call Logs',
      path: '/logs',
      description: 'Review historical inbound and outbound call details, status codes, and charges.',
      icon: History,
      category: 'app',
      requiresAuth: true,
    },
  ];

  const categories = {
    public: 'Public Marketing',
    auth: 'Authentication Gateway',
    app: 'Console Applications',
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoRing}>
            <ExternalLink size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={styles.title}>Application Directory</h1>
            <p style={styles.subtitle}>Explore and navigate to all pages of the CloudPBX system.</p>
          </div>
        </div>
        
        <button onClick={toggleTheme} style={styles.themeToggle} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </header>

      <main style={styles.main}>
        {Object.entries(categories).map(([key, label]) => {
          const categoryRoutes = routes.filter((r) => r.category === key);
          return (
            <section key={key} style={styles.section}>
              <h2 style={styles.sectionTitle}>{label}</h2>
              <div style={styles.grid}>
                {categoryRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <Link key={route.path} to={route.path} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <div style={styles.iconWrapper}>
                          <Icon size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                        {route.requiresAuth ? (
                          <span style={styles.badgeAuth}>Private</span>
                        ) : (
                          <span style={styles.badgePublic}>Public</span>
                        )}
                      </div>
                      
                      <h3 style={styles.cardTitle}>{route.title}</h3>
                      <p style={styles.cardDescription}>{route.description}</p>
                      
                      <div style={styles.cardFooter}>
                        <span style={styles.routePath}>{route.path}</span>
                        <div style={styles.arrowWrapper}>
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <footer style={styles.footer}>
        <p>CloudPBX Portal • Click any card to navigate to that view.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    color: 'var(--text-primary)',
    padding: '40px 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 48px auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap' as const,
    borderBottom: '1px solid var(--border)',
    paddingBottom: '24px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoRing: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'var(--accent-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-strong)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.025em',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: 'var(--shadow-card)',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    gap: '16px',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-card)',
    ':hover': {
      transform: 'translateY(-2px)',
      borderColor: 'var(--accent)',
      boxShadow: 'var(--shadow-glow)',
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAuth: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  badgePublic: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'var(--accent-dim)',
    color: 'var(--accent)',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  cardDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    flexGrow: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
  routePath: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--accent)',
  },
  arrowWrapper: {
    color: 'var(--text-secondary)',
    transition: 'transform 0.15s ease',
  },
  footer: {
    maxWidth: '1200px',
    margin: '64px auto 0 auto',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    fontSize: '13px',
    borderTop: '1px solid var(--border)',
    paddingTop: '24px',
  },
};
