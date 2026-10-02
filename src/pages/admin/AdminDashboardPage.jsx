import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Activity,
  BadgeCheck,
  CreditCard,
  FileSearch,
  Gem,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Clock,
} from 'lucide-react';
import { Alert, EmptyState, ErrorState, PageLoader, StatCard } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[AdminDashboardPage] useEffect triggered');
    Promise.all([api.admin.dashboard(), api.admin.users({ page: 1, pageSize: 6, status: 'PENDING' })])
      .then(([dashboard, pending]) => {
        console.log('[AdminDashboardPage] API success:', { dashboard, pending });
        setMetrics(dashboard.metrics || {});
        setUsers(pending.users || []);
        setError('');
      })
      .catch((err) => {
        console.error('[AdminDashboardPage] API error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader cards={4} />;
  if (error) return <ErrorState title="Failed to load the admin dashboard" message={error} onRetry={() => window.location.reload()} />;

  const cards = [
    { label: 'Total Users', value: metrics.totalUsers ?? 0, icon: Users, color: 'bg-blue-100 text-blue-600', to: '/admin/users' },
    { label: 'Pending Approval', value: metrics.pendingUsers ?? 0, icon: Clock, color: 'bg-amber-100 text-amber-600', to: '/admin/users?status=PENDING' },
    { label: 'Pending KYC Reviews', value: metrics.pendingKyc ?? 0, icon: FileSearch, color: 'bg-purple-100 text-purple-600', to: '/admin/documents' },
    { label: 'Loan Applications', value: metrics.totalLoanApplications ?? 0, icon: CreditCard, color: 'bg-emerald-100 text-emerald-600', to: '/admin/loans' },
    { label: 'Awaiting Decision', value: metrics.pendingApplications ?? 0, icon: FileSearch, color: 'bg-sky-100 text-sky-600', to: '/admin/loans' },
    { label: 'Active Loans', value: metrics.activeLoans ?? 0, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600', to: '/admin/loans' },
    { label: 'Pending Collateral', value: metrics.pendingCollateral ?? 0, icon: Gem, color: 'bg-amber-100 text-amber-600', to: '/admin/collaterals' },
    { label: 'Overdue / Defaulted', value: metrics.overdueLoans ?? 0, icon: TrendingDown, color: 'bg-red-100 text-red-600', to: '/admin/loans' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Signed in as {user?.name} · portfolio overview</p>
        </div>
      </div>

      {metrics.pendingUsers > 0 && (
        <Alert tone="warning">
          <strong>{metrics.pendingUsers}</strong> account{metrics.pendingUsers === 1 ? '' : 's'} awaiting review.{' '}
          <Link to="/admin/users?status=PENDING" className="font-medium underline">Open the review queue</Link>.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.slice(0, 4).map((card) => (
          <Link key={card.label} to={card.to} className="block">
            <StatCard icon={card.icon} label={card.label} value={card.value} color={card.color} />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Accounts Awaiting Review</h2>
            <Link to="/admin/users" className="text-sm text-emerald-700 font-medium hover:underline">View all</Link>
          </div>
          {users.length ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Documents</th>
                    <th>Loans</th>
                    <th>Registered</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                      </td>
                      <td>{row._count?.documents ?? 0}</td>
                      <td>{row._count?.loans ?? 0}</td>
                      <td className="text-gray-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/users?search=${encodeURIComponent(row.email)}`} className="text-sm font-medium text-emerald-700 hover:underline">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={BadgeCheck} title="Review queue is clear" description="No accounts are waiting for approval." />
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health</h2>
            <div className="space-y-4">
              <Row
                label="Approved accounts"
                value={metrics.approvedUsers ?? 0}
                total={metrics.totalUsers ?? 0}
                color="bg-emerald-500"
              />
              <Row
                label="Closed / repaid loans"
                value={metrics.closedLoans ?? 0}
                total={metrics.totalLoanApplications ?? 0}
                color="bg-gray-400"
              />
              <Row
                label="Overdue or defaulted"
                value={metrics.overdueLoans ?? 0}
                total={metrics.totalLoanApplications ?? 0}
                color="bg-red-500"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/users', label: 'Review applicants', icon: UserCheck },
                { to: '/admin/loans', label: 'Process loan applications', icon: CreditCard },
                { to: '/admin/documents', label: 'Verify KYC documents', icon: FileSearch },
                { to: '/admin/payments', label: 'Reconcile payments', icon: Activity },
                { to: '/admin/reports', label: 'Export reports', icon: TrendingUp },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                  <Icon className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, total, color }) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value} <span className="text-gray-400 font-normal">({percent}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
