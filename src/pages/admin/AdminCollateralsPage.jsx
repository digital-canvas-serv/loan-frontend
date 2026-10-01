import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Gem, Scale, ShieldCheck, ShieldX, Undo2 } from 'lucide-react';
import {
  Alert,
  EmptyState,
  ErrorState,
  Modal,
  PageLoader,
  StatCard,
  StatusBadge,
  useAction,
  useToast,
} from '../../components/ui';
import { formatCurrency, formatDate, humanize } from '../../lib/format';

export function AdminCollateralsPage() {
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [target, setTarget] = useState(null);
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.collaterals.list()
      .then((data) => { setCollaterals(data.collaterals || []); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const totals = useMemo(() => {
    const value = collaterals.reduce((sum, item) => sum + Number(item.value || 0), 0);
    return {
      count: collaterals.length,
      value,
      pending: collaterals.filter((item) => item.status === 'PENDING').length,
      verified: collaterals.filter((item) => ['VERIFIED', 'PLEDGED'].includes(item.status)).length,
    };
  }, [collaterals]);

  const visible = filter ? collaterals.filter((item) => item.status === filter) : collaterals;

  const setStatus = async (status) => {
    const result = await action.run(() => api.collaterals.updateStatus(target.id, { status }));
    if (!result) return;
    toast.show(`Collateral ${humanize(status).toLowerCase()}.`);
    setTarget(null);
    load();
  };

  if (loading) return <PageLoader cards={3} />;
  if (error && collaterals.length === 0) return <ErrorState title="Failed to load collateral" message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collateral</h1>
          <p className="page-subtitle">Appraise pledged assets and confirm verification</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gem} label="Assets Registered" value={totals.count} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Scale} label="Total Recorded Value" value={formatCurrency(totals.value)} color="bg-purple-100 text-purple-600" />
        <StatCard icon={ShieldCheck} label="Verified / Pledged" value={totals.verified} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={ShieldX} label="Awaiting Appraisal" value={totals.pending} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All statuses</option>
              {['PENDING', 'VERIFIED', 'PLEDGED', 'RELEASED', 'REJECTED'].map((item) => (
                <option key={item} value={item}>{humanize(item)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}
        {visible.length ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Borrower</th>
                  <th>Declared Value</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium">{item.itemName || item.type}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-1 max-w-xs">{item.description}</p>}
                    </td>
                    <td>
                      <p className="text-sm font-medium">{item.user?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{item.user?.email}</p>
                    </td>
                    <td className="font-medium">{formatCurrency(item.declaredValue ?? item.value)}</td>
                    <td className="text-gray-600">{formatDate(item.createdAt)}</td>
                    <td><StatusBadge status={item.status} kind="collateral" /></td>
                    <td>
                      {['PENDING', 'REJECTED'].includes(item.status) ? (
                        <button className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => { action.setError(''); setTarget(item); }}>
                          Appraise
                        </button>
                      ) : (
                        <button className="text-sm font-medium text-gray-700 hover:underline" onClick={() => { action.setError(''); setTarget(item); }}>
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Gem} title="No collateral found" description="Assets pledged through loan applications will appear here for appraisal." />
        )}
      </div>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target ? `${target.itemName || target.type}` : ''}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setTarget(null)} disabled={action.pending}>Cancel</button>
            {['VERIFIED', 'PLEDGED'].includes(target?.status) && (
              <button className="btn-secondary" onClick={() => setStatus('RELEASED')} disabled={action.pending}>
                <Undo2 className="w-4 h-4" /> Release
              </button>
            )}
            <button className="btn-danger" onClick={() => setStatus('REJECTED')} disabled={action.pending}>
              <ShieldX className="w-4 h-4" /> Reject
            </button>
            <button className="btn-primary" onClick={() => setStatus('VERIFIED')} disabled={action.pending}>
              <ShieldCheck className="w-4 h-4" /> Verify
            </button>
          </>
        )}
      >
        {target && (
          <div className="space-y-4">
            {action.error && <Alert>{action.error}</Alert>}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row label="Type" value={target.type} />
              <Row label="Status" value={humanize(target.status)} />
              <Row label="Borrower" value={`${target.user?.name} (${target.user?.email})`} />
              <Row label="Registered" value={formatDate(target.createdAt)} />
              <Row label="Quantity" value={target.quantity ?? '—'} />
              <Row label="Weight" value={target.weight ?? '—'} />
              <Row label="Recorded value" value={formatCurrency(target.value)} />
              <Row label="Declared value" value={formatCurrency(target.declaredValue ?? target.value)} />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-500 mb-1">Description</p>
              <p className="text-gray-900">{target.description}</p>
            </div>
            {target.ownershipInformation && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="text-gray-500 mb-1">Ownership information</p>
                <p className="text-gray-900">{target.ownershipInformation}</p>
              </div>
            )}
            <Alert tone="info">
              Verifying records your appraisal against the borrower's declaration. Loan approval must use the verified figure, not the declared value.
            </Alert>
            <Link to="/admin/loans" className="text-sm font-medium text-emerald-700 hover:underline">Review loans pledged against this asset →</Link>
          </div>
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
