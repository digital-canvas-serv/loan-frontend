import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, Receipt, Wallet } from 'lucide-react';
import {
  Alert,
  EmptyState,
  ErrorState,
  Modal,
  PageLoader,
  Pagination,
  StatCard,
  StatusBadge,
  useAction,
  useToast,
} from '../../components/ui';
import { formatCurrency, formatDateTime, humanize } from '../../lib/format';

const reconciliationStatuses = ['SUCCESS', 'FAILED', 'REVERSED', 'REFUNDED'];

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [target, setTarget] = useState(null);
  const [decision, setDecision] = useState('SUCCESS');
  const [referenceId, setReferenceId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    console.log('[AdminPaymentsPage] load() called, page:', page);
    setLoading(true);
    api.repayments.list({ page, pageSize: 20 })
      .then((data) => {
        console.log('[AdminPaymentsPage] API success:', data);
        setPayments(data.payments || []);
        setPagination(data.pagination || null);
        setError('');
      })
      .catch((err) => {
        console.error('[AdminPaymentsPage] API error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    console.log('[AdminPaymentsPage] useEffect triggered, load:', load);
    load();
  }, [load]);

  const visible = status ? payments.filter((payment) => payment.status === status) : payments;
  const pendingCount = payments.filter((payment) => payment.status === 'PENDING').length;

  const stats = useMemo(() => ({
    listed: pagination?.total ?? payments.length,
    pending: pendingCount,
    pendingValue: payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    settled: payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0),
  }), [payments, pagination, pendingCount]);

  const openReconcile = (payment) => {
    action.setError('');
    setTarget(payment);
    setDecision('SUCCESS');
    setReferenceId(payment.referenceId || '');
  };

  const submitReconcile = async (e) => {
    e.preventDefault();
    const result = await action.run(() => api.repayments.reconcile(target.id, {
      status: decision,
      referenceId: referenceId.trim() || undefined,
    }));
    if (!result) return;
    toast.show(`Payment ${humanize(decision).toLowerCase()}.`);
    setTarget(null);
    load();
  };

  const showReceipt = async (payment) => {
    action.setError('');
    const result = await action.run(() => api.repayments.receipt(payment.id));
    if (result) setReceipt(result.receipt);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Reconcile submitted payments against bank references</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Payments Listed" value={stats.listed} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Receipt} label="Pending Reconciliation" value={stats.pending} color="bg-amber-100 text-amber-600" />
        <StatCard icon={Receipt} label="Pending Value" value={formatCurrency(stats.pendingValue)} color="bg-purple-100 text-purple-600" />
        <StatCard icon={CheckCircle2} label="Settled On This Page" value={formatCurrency(stats.settled)} color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {['PENDING', 'SUCCESS', 'FAILED', 'REVERSED', 'REFUNDED'].map((item) => (
                <option key={item} value={item}>{humanize(item)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />)}
          </div>
        ) : visible.length ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Loan</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th className="w-36"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <p className="font-medium">{payment.recorder?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{payment.recorder?.email}</p>
                      </td>
                      <td className="max-w-[200px] truncate">{payment.loan?.purpose || '—'}</td>
                      <td className="font-medium">{formatCurrency(payment.amount, true)}</td>
                      <td>{humanize(payment.method)}</td>
                      <td className="text-gray-600">{payment.referenceId || '—'}</td>
                      <td className="text-gray-600">{formatDateTime(payment.paymentDate)}</td>
                      <td><StatusBadge status={payment.status} kind="payment" /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          {payment.status === 'PENDING' && (
                            <button className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => openReconcile(payment)}>
                              Reconcile
                            </button>
                          )}
                          <button className="text-sm font-medium text-gray-700 hover:underline" onClick={() => showReceipt(payment)}>
                            Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title={status ? `No ${humanize(status).toLowerCase()} payments` : 'No payments recorded'}
            description={status === 'PENDING' ? 'The reconciliation queue is clear.' : 'Payments submitted by borrowers will appear here.'}
          />
        )}
      </div>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Reconcile payment"
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setTarget(null)} disabled={action.pending}>Cancel</button>
            <button form="reconcile-form" type="submit" className="btn-primary" disabled={action.pending}>
              {action.pending ? 'Applying...' : 'Confirm'}
            </button>
          </>
        )}
      >
        {target && (
          <form id="reconcile-form" onSubmit={submitReconcile} className="space-y-4">
            {action.error && <Alert>{action.error}</Alert>}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold text-gray-900">{formatCurrency(target.amount, true)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium text-gray-900">{humanize(target.method)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Loan</span><span className="font-medium text-gray-900">{target.loan?.purpose || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted by</span><span className="font-medium text-gray-900">{target.recorder?.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted at</span><span className="font-medium text-gray-900">{formatDateTime(target.createdAt)}</span></div>
            </div>
            <div className="field">
              <label className="label" htmlFor="reconcile-status">Outcome</label>
              <select id="reconcile-status" className="input" value={decision} onChange={(e) => setDecision(e.target.value)} disabled={action.pending}>
                {reconciliationStatuses.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="reconcile-ref">Bank Reference</label>
              <input id="reconcile-ref" className="input" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="Recorded against the payment" disabled={action.pending} />
            </div>
            <Alert tone="warning">
              Only pending payments can be reconciled, and each decision is written to the audit log. This cannot be undone from the interface.
            </Alert>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        title="Payment receipt"
        footer={<button className="btn-primary" onClick={() => setReceipt(null)}>Close</button>}
      >
        {receipt && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-gray-500">Payment ID</span><span className="font-mono text-xs text-gray-700">{receipt.paymentId}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Borrower</span><span className="font-medium text-gray-900 text-right">{receipt.user?.name} ({receipt.user?.email})</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Loan</span><span className="font-medium text-gray-900 text-right">{receipt.loanPurpose}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Amount</span><span className="font-semibold text-gray-900">{formatCurrency(receipt.amount, true)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Method</span><span className="font-medium text-gray-900">{humanize(receipt.method)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Reference</span><span className="font-medium text-gray-900">{receipt.referenceId || '—'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Payment date</span><span className="font-medium text-gray-900">{formatDateTime(receipt.paymentDate)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Status</span><StatusBadge status={receipt.status} kind="payment" /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
