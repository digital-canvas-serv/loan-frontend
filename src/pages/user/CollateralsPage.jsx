import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { AlertCircle, Gem, Plus, Scale } from 'lucide-react';
import { Alert, EmptyState, ErrorState, Modal, PageLoader, StatCard, StatusBadge, useAction, useToast } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

const collateralTypes = ['Gold/Jewellery', 'Electronics', 'Vehicle', 'Other eligible assets'];

const emptyForm = {
  type: 'Gold/Jewellery',
  itemName: '',
  description: '',
  quantity: '1',
  weight: '',
  value: '',
  ownershipInformation: '',
};

export function CollateralsPage() {
  const { user } = useAuth();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const action = useAction();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.collaterals.list()
      .then((data) => { setCollaterals(data.collaterals || []); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totals = useMemo(() => {
    const declared = collaterals.reduce((sum, item) => sum + Number(item.declaredValue ?? item.value ?? 0), 0);
    const verified = collaterals
      .filter((item) => ['VERIFIED', 'PLEDGED'].includes(item.status))
      .reduce((sum, item) => sum + Number(item.value ?? 0), 0);
    return {
      count: collaterals.length,
      declared,
      verified,
      pending: collaterals.filter((item) => item.status === 'PENDING').length,
    };
  }, [collaterals]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.value || Number(form.value) <= 0) {
      action.setError('Type, description and a positive value are required.');
      return;
    }
    const created = await action.run(() => api.collaterals.create({
      type: form.type,
      description: form.description.trim(),
      value: Number(form.value),
    }));
    if (!created) return;
    toast.show('Collateral submitted for verification.');
    setShowForm(false);
    setForm(emptyForm);
    load();
  };

  if (loading) return <PageLoader cards={3} />;
  if (error && collaterals.length === 0) return <ErrorState title="Failed to load collaterals" message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collaterals</h1>
          <p className="page-subtitle">
            {isAdmin ? 'All pledged assets across borrower accounts' : 'Assets pledged as security for your loans'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { action.setError(''); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Collateral
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gem} label="Items Registered" value={totals.count} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Scale} label="Declared Value" value={formatCurrency(totals.declared)} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Scale} label="Verified Value" value={formatCurrency(totals.verified)} color="bg-purple-100 text-purple-600" />
        <StatCard icon={AlertCircle} label="Awaiting Review" value={totals.pending} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Assets</h2>
        {error && <Alert className="mb-4">{error}</Alert>}
        {collaterals.length ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {isAdmin && <th>Borrower</th>}
                  <th>Asset</th>
                  <th>Declared Value</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {collaterals.map((item) => (
                  <tr key={item.id}>
                    {isAdmin && (
                      <td>
                        <p className="font-medium">{item.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{item.user?.email}</p>
                      </td>
                    )}
                    <td>
                      <p className="font-medium">{item.itemName || item.type}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-1 max-w-xs">{item.description}</p>}
                    </td>
                    <td>{formatCurrency(item.declaredValue ?? item.value)}</td>
                    <td className="text-gray-600">{formatDate(item.createdAt)}</td>
                    <td><StatusBadge status={item.status} kind="collateral" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Gem}
            title="No collateral registered"
            description="Register an asset to strengthen your borrowing profile, or attach one when you apply for a loan."
            action={<button className="btn-primary mt-4" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Collateral</button>}
          />
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Register Collateral"
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setShowForm(false)} disabled={action.pending}>Cancel</button>
            <button form="collateral-form" type="submit" className="btn-primary" disabled={action.pending}>
              {action.pending ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </>
        )}
      >
        <form id="collateral-form" onSubmit={submit} className="space-y-4">
          {action.error && <Alert>{action.error}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label className="label" htmlFor="c-type">Collateral Type *</label>
              <select id="c-type" className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={action.pending}>
                {collateralTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="c-item">Item Name</label>
              <input id="c-item" className="input" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. 22k gold chain" disabled={action.pending} />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="c-desc">Description *</label>
            <textarea id="c-desc" className="input min-h-[90px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Condition, model, identifying marks" disabled={action.pending} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="field">
              <label className="label" htmlFor="c-qty">Quantity</label>
              <input id="c-qty" type="number" step="0.001" min="0.001" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} disabled={action.pending} />
            </div>
            <div className="field">
              <label className="label" htmlFor="c-weight">Weight (opt.)</label>
              <input id="c-weight" type="number" step="0.001" min="0" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} disabled={action.pending} />
            </div>
            <div className="field">
              <label className="label" htmlFor="c-value">Declared Value *</label>
              <input id="c-value" type="number" step="0.01" min="0.01" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="25000" disabled={action.pending} />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="c-owner">Ownership Information</label>
            <textarea id="c-owner" className="input min-h-[80px] resize-y" value={form.ownershipInformation} onChange={(e) => setForm({ ...form, ownershipInformation: e.target.value })} placeholder="Invoice number, purchase date, registration details" disabled={action.pending} />
          </div>
          <Alert tone="info">
            Declared value is recorded as-is. A reviewer sets the verified value during appraisal, and approvals never rely on the declared figure alone.
          </Alert>
        </form>
      </Modal>
    </div>
  );
}
