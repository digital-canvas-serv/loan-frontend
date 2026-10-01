import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ChevronDown, CreditCard, Eye, Search } from 'lucide-react';
import {
  Alert,
  EmptyState,
  ErrorState,
  Modal,
  PageLoader,
  Pagination,
  StatusBadge,
  useAction,
  useToast,
} from '../../components/ui';
import { formatCurrency, formatDate, humanize } from '../../lib/format';

const statuses = [
  'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'COLLATERAL_VERIFICATION',
  'APPROVED', 'DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'REJECTED', 'CANCELLED', 'DEFAULTED',
];

const nextStatuses = ['UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'COLLATERAL_VERIFICATION', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'CANCELLED'];

export function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detail, setDetail] = useState(null);
  const [decision, setDecision] = useState({ status: 'UNDER_REVIEW', approvedAmount: '', approvedTenureMonths: '', interestRate: '', reviewNote: '' });
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.loans.list({ page, pageSize: 20, search, status })
      .then((data) => {
        setLoans(data.loans || []);
        setPagination(data.pagination || null);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(load, [load]);

  const openDetail = (loan) => {
    action.setError('');
    setDetail(loan);
    setDecision({
      status: 'UNDER_REVIEW',
      approvedAmount: String(loan.requestedAmount ?? loan.amount ?? ''),
      approvedTenureMonths: String(loan.requestedTenureMonths ?? loan.termMonths ?? ''),
      interestRate: String(loan.product?.baseRate ?? loan.interestRate ?? ''),
      reviewNote: loan.reviewNote || '',
    });
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    const body = { status: decision.status, reviewNote: decision.reviewNote.trim() || undefined };
    if (decision.status === 'APPROVED') {
      const principal = Number(decision.approvedAmount);
      const tenure = Number(decision.approvedTenureMonths);
      const rate = Number(decision.interestRate);
      if (!principal || principal <= 0 || !Number.isInteger(tenure) || tenure <= 0 || Number.isNaN(rate) || rate < 0) {
        action.setError('Approved amount, tenure and interest rate are required to approve a loan.');
        return;
      }
      if (principal > Number(detail.requestedAmount ?? detail.amount)) {
        action.setError('Approved amount cannot exceed the requested amount.');
        return;
      }
      body.approvedAmount = principal;
      body.approvedTenureMonths = tenure;
      body.interestRate = rate;
    }
    const result = await action.run(() => api.loans.updateStatus(detail.id, body));
    if (!result) return;
    toast.show(`Loan marked ${humanize(decision.status).toLowerCase()}.`);
    setDetail(null);
    load();
  };

  const preview = (() => {
    const principal = Number(decision.approvedAmount);
    const tenure = Number(decision.approvedTenureMonths);
    const rate = Number(decision.interestRate);
    if (decision.status !== 'APPROVED' || !principal || !Number.isInteger(tenure) || tenure <= 0 || Number.isNaN(rate)) return null;
    const monthlyRate = rate / 100 / 12;
    const payment = monthlyRate === 0 ? principal / tenure : principal * monthlyRate * ((1 + monthlyRate) ** tenure) / (((1 + monthlyRate) ** tenure) - 1);
    const feeRate = Number(detail?.product?.originationFeeRate || 0);
    const fees = principal * feeRate / 100;
    return { payment, fees, total: payment * tenure + fees };
  })();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Applications</h1>
          <p className="page-subtitle">Review, appraise collateral and issue decisions</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search by purpose or borrower name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative sm:w-56">
            <select className="input pr-10 appearance-none" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {statuses.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />)}
          </div>
        ) : loans.length ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Purpose</th>
                    <th>Requested</th>
                    <th>Collateral</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <p className="font-medium">{loan.user?.name}</p>
                        <p className="text-xs text-gray-500">{loan.user?.email}</p>
                      </td>
                      <td className="max-w-[220px] truncate">{loan.purpose}</td>
                      <td className="font-medium">{formatCurrency(loan.requestedAmount ?? loan.amount)}</td>
                      <td>
                        <p className="text-sm">{loan.collateral?.type || '—'}</p>
                        <StatusBadge status={loan.collateral?.status} kind="collateral" className="mt-1" />
                      </td>
                      <td><StatusBadge status={loan.status} /></td>
                      <td className="text-gray-600">{formatDate(loan.createdAt)}</td>
                      <td>
                        <button className="text-sm font-medium text-emerald-700 hover:underline inline-flex items-center gap-1" onClick={() => openDetail(loan)}>
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onChange={setPage} />
          </>
        ) : (
          <EmptyState icon={CreditCard} title="No applications found" description={search || status ? 'Try adjusting your search or status filter.' : 'No loan applications have been submitted yet.'} />
        )}
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.purpose}` : ''}
        size="xl"
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setDetail(null)} disabled={action.pending}>Cancel</button>
            <button form="loan-decision-form" type="submit" className="btn-primary" disabled={action.pending}>
              {action.pending ? 'Applying...' : 'Apply decision'}
            </button>
          </>
        )}
      >
        {detail && (
          <form id="loan-decision-form" onSubmit={submitDecision} className="space-y-5">
            {action.error && <Alert>{action.error}</Alert>}

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row label="Borrower" value={`${detail.user?.name} (${detail.user?.email})`} />
              <Row label="Submitted" value={formatDate(detail.createdAt)} />
              <Row label="Product" value={detail.product?.name || 'Secured loan'} />
              <Row label="Repayment preference" value={humanize(detail.repaymentPreference) || '—'} />
              <Row label="Requested amount" value={formatCurrency(detail.requestedAmount ?? detail.amount)} />
              <Row label="Requested tenure" value={`${detail.requestedTenureMonths ?? detail.termMonths} months`} />
              <Row label="Current status" value={humanize(detail.status)} />
              <Row label="Approved amount" value={detail.approvedAmount ? formatCurrency(detail.approvedAmount) : '—'} />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Collateral appraisal</h3>
              {detail.collateral ? (
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <Row label="Type" value={detail.collateral.type} />
                  <Row label="Item" value={detail.collateral.itemName || '—'} />
                  <Row label="Quantity" value={detail.collateral.quantity ?? '—'} />
                  <Row label="Weight" value={detail.collateral.weight ?? '—'} />
                  <Row label="Declared value" value={formatCurrency(detail.collateral.declaredValue ?? detail.collateral.value)} />
                  <Row label="Status" value={humanize(detail.collateral.status)} />
                  <div className="sm:col-span-2">
                    <Row label="Description" value={detail.collateral.description} />
                  </div>
                  {detail.collateral.ownershipInformation && (
                    <div className="sm:col-span-2">
                      <Row label="Ownership" value={detail.collateral.ownershipInformation} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No collateral attached.</p>
              )}
              <p className="text-xs text-gray-500 mt-3">Declared value is the borrower's claim only. Set the approved amount on verified appraisal, never on the declared figure.</p>
            </div>

            {detail.documents?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Evidence files ({detail.documents.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.documents.map((document) => (
                    <span key={document.id} className="badge badge-neutral">{document.filename}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="field">
                <label className="label" htmlFor="loan-status">Decision</label>
                <select id="loan-status" className="input" value={decision.status} onChange={(e) => setDecision({ ...decision, status: e.target.value })} disabled={action.pending}>
                  {nextStatuses.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
                </select>
              </div>

              {decision.status === 'APPROVED' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="field">
                    <label className="label" htmlFor="la">Approved Amount *</label>
                    <input id="la" type="number" step="0.01" min="0.01" className="input" value={decision.approvedAmount} onChange={(e) => setDecision({ ...decision, approvedAmount: e.target.value })} disabled={action.pending} />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="lt">Tenure (months) *</label>
                    <input id="lt" type="number" min="1" className="input" value={decision.approvedTenureMonths} onChange={(e) => setDecision({ ...decision, approvedTenureMonths: e.target.value })} disabled={action.pending} />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="lr">Interest Rate % *</label>
                    <input id="lr" type="number" step="0.01" min="0" className="input" value={decision.interestRate} onChange={(e) => setDecision({ ...decision, interestRate: e.target.value })} disabled={action.pending} />
                  </div>
                </div>
              )}

              {preview && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-700">Monthly payment</p>
                    <p className="font-semibold text-emerald-900">{formatCurrency(preview.payment, true)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Origination fee</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(preview.fees, true)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total payable</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(preview.total, true)}</p>
                  </div>
                </div>
              )}

              <div className="field">
                <label className="label" htmlFor="loan-note">Review Note</label>
                <textarea id="loan-note" className="input min-h-[80px] resize-y" value={decision.reviewNote} onChange={(e) => setDecision({ ...decision, reviewNote: e.target.value })} placeholder="Shared with the borrower via notifications" disabled={action.pending} />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right break-words">{value ?? '—'}</span>
    </div>
  );
}
