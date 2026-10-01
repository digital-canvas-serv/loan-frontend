import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, CreditCard, Gem, TrendingUp, ArrowRight, DollarSign, AlertCircle } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your borrowing activity</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  const statCards = [
    { label: 'Total Borrowed', value: formatCurrency(metrics.borrowed), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Outstanding', value: formatCurrency(metrics.outstanding), icon: CreditCard, color: 'bg-amber-100 text-amber-600' },
    { label: 'Collateral Items', value: metrics.collateralCount || 0, icon: Gem, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Loans', value: metrics.activeLoans || 0, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your borrowing activity</p>
        </div>
        <Link to="/loans/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Loan Request
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="stat-label mt-4">{stat.label}</p>
            <p className="stat-value mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Loan Applications</h2>
          <Link to="/loans" className="text-sm text-emerald-700 font-medium hover:underline">View all</Link>
        </div>
        {data?.recentLoans?.length ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Term</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {data.recentLoans.slice(0, 5).map((loan) => (
                  <tr key={loan.id}>
                    <td className="font-medium">{loan.purpose}</td>
                    <td>{formatCurrency(loan.approvedAmount || loan.amount)}</td>
                    <td>{loan.termMonths} months</td>
                    <td>{loan.interestRate}%</td>
                    <td><span className={`badge ${getStatusBadge(loan.status)}`}>{loan.status.replace(/_/g, ' ')}</span></td>
                    <td>
                      <Link to={`/loans/${loan.id}`} className="text-emerald-700 hover:underline text-sm font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CreditCard className="empty-state-icon" />
            <h3 className="empty-state-title">No loan applications yet</h3>
            <p className="empty-state-desc">Start your first loan application to get started</p>
            <Link to="/loans/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              New Loan Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  const map = {
    SUBMITTED: 'badge-processing',
    UNDER_REVIEW: 'badge-processing',
    DOCUMENTS_REQUIRED: 'badge-warning',
    COLLATERAL_VERIFICATION: 'badge-warning',
    APPROVED: 'badge-success',
    DISBURSED: 'badge-success',
    ACTIVE: 'badge-success',
    OVERDUE: 'badge-danger',
    CLOSED: 'badge-neutral',
    PAID: 'badge-success',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-neutral',
    DEFAULTED: 'badge-danger',
    PENDING: 'badge-processing',
    VERIFIED: 'badge-success',
    RELEASED: 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
}