import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './stores/authStore';
import { useTheme } from './stores/themeStore';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NumbersPage from './pages/NumbersPage';
import NumberDetailPage from './pages/NumberDetailPage';
import CallLogsPage from './pages/CallLogsPage';
import IVRBuilderPage from './pages/IVRBuilderPage';
import LandingPage from './pages/LandingPage';
import LinksPage from './pages/LinksPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
