import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Check, CreditCard, Calendar, DollarSign, Percent, Clock, AlertCircle } from 'lucide-react';

const formatCurrency = (value) => value == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '—';

const stages = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'COLLATERAL_VERIFICATION', 'APPROVED', 'DISBURSED', 'ACTIVE', 'CLOSED'];

export function LoanDetailPage() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.loans.get(id)
      .then((data) => setLoan(data.loan))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="page-header">
          <Link to="/loans" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</Link>
        </div>
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="page-header"><Link to="/loans" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</Link></div>
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load loan</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/loans" className="btn-primary">Back to Loans</Link>
        </div>
      </div>
    );
  }

  const currentStage = stages.indexOf(loan.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <Link to="/loans" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <div>
          <p className="text-sm text-gray-500">Loan Application</p>
          <h1 className="page-title">{loan.purpose}</h1>
        </div>
        <span className={`badge ${getStatusBadge(loan.status)} text-sm px-3 py-1`}>{loan.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h2>
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200" />
          {stages.map((stage, index) => (
            <div key={stage} className="relative pl-16 pb-8 last:pb-0 flex items-start">
              <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${index <= currentStage ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'} flex items-center justify-center z-10`}>
                {index <= currentStage && <Check className="w-2 h-2 text-white" />}
              </div>
              <div className={`ml-4 ${index <= currentStage ? 'text-gray-900' : 'text-gray-500'}`}>
                <p className="font-medium capitalize">{stage.toLowerCase().replace(/_/g, ' ')}</p>
                {index === 4 && loan.approvedAt && <p className="text-sm text-gray-500">Approved: {formatDate(loan.approvedAt)}</p>}
                {index === 5 && loan.disbursedAt && <p className="text-sm text-gray-500">Disbursed: {formatDate(loan.disbursedAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.requestedAmount)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Approved Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.approvedAmount)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
          <p className="text-2xl font-bold text-gray-900">{loan.interestRate}%</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Term</p>
          <p className="text-xl font-bold text-gray-900">{loan.termMonths} months</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Payable</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.totalPayable)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Start Date</p>
          <p className="text-xl font-bold text-gray-900">{formatDate(loan.startDate)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collateral</h2>
          {loan.collateral ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{loan.collateral.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Item</span>
                <span className="font-medium">{loan.collateral.itemName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Value</span>
                <span className="font-medium">{formatCurrency(loan.collateral.value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`badge ${getCollateralBadge(loan.collateral.status)}`}>{loan.collateral.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No collateral information</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Product</h2>
          {loan.product ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Product</span>
                <span className="font-medium">{loan.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Base Rate</span>
                <span className="font-medium">{loan.product.baseRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Term Range</span>
                <span className="font-medium">{loan.product.minTermMonths}-{loan.product.maxTermMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Range</span>
                <span className="font-medium">{formatCurrency(loan.product.minAmount)} - {formatCurrency(loan.product.maxAmount)}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No product information</p>
          )}
        </div>
      </div>

      {loan.reviewNote && (
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="font-medium text-amber-900 mb-2">Review Note</h3>
          <p className="text-amber-800">{loan.reviewNote}</p>
        </div>
      )}
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

function getCollateralBadge(status) {
  const map = {
    PENDING: 'badge-processing',
    VERIFIED: 'badge-success',
    PLEDGED: 'badge-success',
    RELEASED: 'badge-neutral',
    REJECTED: 'badge-danger',
  };
  return map[status] || 'badge-neutral';
}