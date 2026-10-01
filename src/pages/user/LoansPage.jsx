import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, CreditCard, Search, Filter, ChevronDown } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    api.loans.list(params.toString() ? `?${params.toString()}` : '')
      .then((data) => setLoans(data.loans || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'COLLATERAL_VERIFICATION', 'APPROVED', 'DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'PAID', 'REJECTED', 'CANCELLED', 'DEFAULTED'];

  const filteredLoans = loans;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Loans</h1>
            <p className="page-subtitle">View and manage your loan applications</p>
          </div>
          <Link to="/loans/new" className="btn-primary"><Plus className="w-4 h-4" /> New Request</Link>
        </div>
        <div className="card">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Loans</h1>
          <p className="page-subtitle">View and manage your loan applications</p>
        </div>
        <Link to="/loans/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search loans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="input pl-10 pr-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {filteredLoans.length ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Loan Purpose</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Term</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="font-medium">{loan.purpose}</td>
                    <td>{loan.product?.name || 'Secured Loan'}</td>
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
            <h3 className="empty-state-title">No loans found</h3>
            <p className="empty-state-desc">{search || statusFilter ? 'Try adjusting your filters' : 'You haven\'t applied for any loans yet'}</p>
            {!search && !statusFilter && (
              <Link to="/loans/new" className="btn-primary inline-flex mt-4">
                <Plus className="w-4 h-4" />
                Apply for a Loan
              </Link>
            )}
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
  };
  return map[status] || 'badge-neutral';
}