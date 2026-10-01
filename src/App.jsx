import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/user/DashboardPage';
import { LoansPage } from './pages/user/LoansPage';
import { LoanDetailPage } from './pages/user/LoanDetailPage';
import { NewLoanPage } from './pages/user/NewLoanPage';
import { CollateralsPage } from './pages/user/CollateralsPage';
import { RepaymentsPage } from './pages/user/RepaymentsPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLoansPage } from './pages/admin/AdminLoansPage';
import { AdminCollateralsPage } from './pages/admin/AdminCollateralsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { SiteLayout } from './components/site/SiteLayout';
import { AboutUsPage } from './pages/public/AboutUsPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/public/TermsConditionsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

/** Sends signed-in visitors to their workspace, everyone else to sign in. */
function LandingRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/" element={<LandingRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route element={<Protected />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/new" element={<NewLoanPage />} />
          <Route path="/loans/:id" element={<LoanDetailPage />} />
          <Route path="/collaterals" element={<CollateralsPage />} />
          <Route path="/repayments" element={<RepaymentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route element={<Protected adminOnly />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/loans" element={<AdminLoansPage />} />
            <Route path="/admin/collaterals" element={<AdminCollateralsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/documents" element={<AdminDocumentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}