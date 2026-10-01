import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Calendar, CreditCard, ReceiptText, Wallet } from 'lucide-react';
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
import { formatCurrency, formatDate, humanize } from '../../lib/format';

const methods = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'OTHER', label: 'Other' },
];

export function RepaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);
  const [form, setForm] = useState({ amount: '', method: 'BANK_TRANSFER', referenceId: '' });
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.repayments.list({ page, pageSize: 20 })
      .then((data) => {
        setPayments(data.payments || []);
        setPagination(data.pagination || null);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  const totals = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);
    return { paid, pending };
  }, [payments]);

  const openPay = async (loan) => {
    action.setError('');
    if (!loan) return;
    setForm({ amount: '', method: 'BANK_TRANSFER', referenceId: '' });
    setPaying({ loan, summary: null });
    try {
      const data = await api.repayments.summary(loan.id);
      const outstanding = data.summary?.outstanding ?? 0;
      setPaying({ loan, summary: data.summary ?? null });
      setForm((current) => ({ ...current, amount: outstanding > 0 ? String(outstanding.toFixed(2)) : '' }));
    } catch {
      /* outstanding balance is a convenience only; submission is validated server-side */
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      action.setError('Enter a payment amount greater than zero.');
      return;
    }
    const result = await action.run(() => api.repayments.createPayment({
      loanId: paying.loan.id,
      amount,
      method: form.method,
      referenceId: form.referenceId.trim() || undefined,
    }));
    if (!result) return;
    toast.show('Payment submitted and awaiting reconciliation.');
    setPaying(null);
    load();
  };

  const showReceipt = async (payment) => {
    action.setError('');
    const result = await action.run(() => api.repayments.receipt(payment.id));
    if (result) setPaying({ loan: null, receipt: result.receipt });
  };

  if (loading) return <PageLoader cards={3} />;
  if (error && payments.length === 0) return <ErrorState title="Failed to load repayments" message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repayments</h1>
          <p className="page-subtitle">Make payments and track reconciliation status</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Settled Payments" value={formatCurrency(totals.paid)} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Calendar} label="Awaiting Reconciliation" value={formatCurrency(totals.pending)} color="bg-amber-100 text-amber-600" />
        <StatCard icon={ReceiptText} label="Payments Listed" value={pagination?.total ?? payments.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={CreditCard} label="Loans With Activity" value={new Set(payments.map((p) => p.loanId)).size} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        {error && <Alert className="mb-4">{error}</Alert>}
        {payments.length ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Loan</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="w-44"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <p className="font-medium">{payment.loan?.purpose || 'Loan'}</p>
                        <p className="text-xs text-gray-500">of {formatCurrency(payment.loan?.approvedAmount ?? payment.loan?.amount)}</p>
                      </td>
                      <td className="font-medium">{formatCurrency(payment.amount, true)}</td>
                      <td>{humanize(payment.method)}</td>
                      <td className="text-gray-600">{payment.referenceId || '—'}</td>
                      <td className="text-gray-600">{formatDate(payment.paymentDate)}</td>
                      <td><StatusBadge status={payment.status} kind="payment" /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <button className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => showReceipt(payment)}>
                            Receipt
                          </button>
                          {['ACTIVE', 'APPROVED', 'DISBURSED'].includes(payment.loan?.status) && (
                            <button className="text-sm font-medium text-gray-700 hover:underline" onClick={() => openPay(payment.loan)}>
                              Pay
                            </button>
                          )}
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
            icon={ReceiptText}
            title="No payments recorded"
            description="Payments made against an active loan will appear here once submitted."
          />
        )}
      </div>

      <Modal
        open={Boolean(paying)}
        onClose={() => { setPaying(null); action.setError(''); }}
        title={paying?.receipt ? 'Payment receipt' : `Make a payment${paying?.loan ? ` — ${paying.loan.purpose}` : ''}`}
        footer={paying?.receipt ? (
          <button className="btn-primary" onClick={() => setPaying(null)}>Close</button>
        ) : paying ? (
          <>
            <button className="btn-secondary" onClick={() => setPaying(null)} disabled={action.pending}>Cancel</button>
            <button form="payment-form" type="submit" className="btn-primary" disabled={action.pending}>
              {action.pending ? 'Submitting...' : 'Submit Payment'}
            </button>
          </>
        ) : null}
      >
        {paying?.receipt ? (
          <Receipt receipt={paying.receipt} />
        ) : paying?.loan ? (
          <form id="payment-form" onSubmit={submitPayment} className="space-y-4">
            {action.error && <Alert>{action.error}</Alert>}
            {paying?.summary && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Total Due</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(paying.summary.totalDue)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(paying.summary.paid)}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700">Outstanding</p>
                  <p className="font-semibold text-emerald-800">{formatCurrency(paying.summary.outstanding)}</p>
                </div>
              </div>
            )}
            <div className="field">
              <label className="label" htmlFor="pay-amount">Amount *</label>
              <input id="pay-amount" type="number" step="0.01" min="0.01" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} disabled={action.pending} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label className="label" htmlFor="pay-method">Method *</label>
                <select id="pay-method" className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} disabled={action.pending}>
                  {methods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="pay-ref">Reference</label>
                <input id="pay-ref" className="input" value={form.referenceId} onChange={(e) => setForm({ ...form, referenceId: e.target.value })} placeholder="Bank reference" disabled={action.pending} />
              </div>
            </div>
            <Alert tone="info">Payments are recorded as pending and take effect once an administrator reconciles them.</Alert>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}

function Receipt({ receipt }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Payment Receipt</p>
          <p className="font-mono text-xs text-gray-400">{receipt.paymentId}</p>
        </div>
        <StatusBadge status={receipt.status} kind="payment" />
      </div>
      <dl className="space-y-2 text-sm">
        {[
          ['Borrower', `${receipt.user?.name} (${receipt.user?.email})`],
          ['Loan', receipt.loanPurpose],
          ['Amount', formatCurrency(receipt.amount, true)],
          ['Method', humanize(receipt.method)],
          ['Reference', receipt.referenceId || '—'],
          ['Payment date', formatDate(receipt.paymentDate)],
          ['Submitted', formatDate(receipt.createdAt)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
