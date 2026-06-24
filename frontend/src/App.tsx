import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './stores/authStore';
import { useTheme } from './stores/themeStore';
import AppLayout from './components/AppLayout';
import MarketingLayout from './components/MarketingLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LinksPage from './pages/LinksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Marketing / Support pages
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import IVRMarketingPage from './pages/IVRMarketingPage';
import AnalyticsMarketingPage from './pages/AnalyticsMarketingPage';
import APIDocsPage from './pages/APIDocsPage';
import WebhooksMarketingPage from './pages/WebhooksMarketingPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import PressKitPage from './pages/PressKitPage';
import AffiliatesPage from './pages/AffiliatesPage';
import DocumentationPage from './pages/DocumentationPage';
import StatusPage from './pages/StatusPage';
import ContactPage from './pages/ContactPage';
import CommunityPage from './pages/CommunityPage';
import SLAPage from './pages/SLAPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiePolicyPage from './pages/CookiePolicyPage';

// Private application pages
import DashboardPage from './pages/DashboardPage';
import NumbersPage from './pages/NumbersPage';
import NumberDetailPage from './pages/NumberDetailPage';
import CallLogsPage from './pages/CallLogsPage';
import IVRBuilderPage from './pages/IVRBuilderPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import SmsPage from './pages/SmsPage';
import AdminPage from './pages/AdminPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public Marketing/Support pages layout wrapper */}
      <Route element={<MarketingLayout />}>
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/ivr" element={<IVRMarketingPage />} />
        <Route path="/analytics" element={<AnalyticsMarketingPage />} />
        <Route path="/api-docs" element={<APIDocsPage />} />
        <Route path="/webhooks" element={<WebhooksMarketingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press-kit" element={<PressKitPage />} />
        <Route path="/affiliates" element={<AffiliatesPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/sla" element={<SLAPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
      </Route>

      {/* Private Application Dashboard routes */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/numbers" element={<NumbersPage />} />
        <Route path="/numbers/:id" element={<NumberDetailPage />} />
        <Route path="/numbers/:id/ivr" element={<IVRBuilderPage />} />
        <Route path="/logs" element={<CallLogsPage />} />
        <Route path="/sms" element={<SmsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
