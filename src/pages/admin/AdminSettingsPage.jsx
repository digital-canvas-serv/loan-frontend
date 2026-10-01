import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FileStack, Plus, ScrollText, Settings as SettingsIcon } from 'lucide-react';
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
import { formatDateTime, humanize } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

const emptyType = { name: '', description: '', required: true, active: true };

export function AdminSettingsPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyType);
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.admin.documentTypes()
      .then((data) => { setTypes(data.types || []); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const openCreate = () => {
    action.setError('');
    setForm(emptyType);
    setModal('create');
  };

  const openEdit = (type) => {
    action.setError('');
    setForm({ name: type.name, description: type.description || '', required: type.required, active: type.active });
    setModal(type);
  };

  const save = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      action.setError('Document type name must be at least 2 characters.');
      return;
    }
    const body = { name: form.name.trim(), description: form.description.trim() || undefined, required: form.required, active: form.active };
    const result = modal === 'create'
      ? await action.run(() => api.admin.createDocumentType(body))
      : await action.run(() => api.admin.updateDocumentType(modal.id, body));
    if (!result) return;
    toast.show(modal === 'create' ? 'Document type created.' : 'Document type updated.');
    setModal(null);
    load();
  };

  if (loading) return <PageLoader rows={4} />;
  if (error && types.length === 0) return <ErrorState title="Failed to load settings" message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Document requirements and the audit trail</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-start gap-4">
          <div className="stat-icon bg-emerald-100 text-emerald-600"><SettingsIcon className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">Your role</p>
            <p className="text-sm text-gray-500">{user?.name} · {user?.email}</p>
            <div className="mt-2"><StatusBadge status={user?.role} kind="role" /></div>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="stat-icon bg-blue-100 text-blue-600"><FileStack className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">Document types</p>
            <p className="text-sm text-gray-500">{types.length} configured · {types.filter((t) => t.required).length} required</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">KYC Document Types</h2>
          <button className="btn-primary btn-sm" onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Type
          </button>
        </div>
        {error && <Alert className="mb-4">{error}</Alert>}
        {types.length ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Required</th>
                  <th>Active</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id}>
                    <td className="font-medium">{type.name}</td>
                    <td className="text-gray-600">{type.description || '—'}</td>
                    <td>{type.required ? <span className="badge badge-warning">Required</span> : <span className="badge badge-neutral">Optional</span>}</td>
                    <td>{type.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-neutral">Inactive</span>}</td>
                    <td>
                      <button className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => openEdit(type)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileStack} title="No document types configured" description="Add the document types applicants must submit for KYC verification." />
        )}
      </div>

      <AuditLog />

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'New document type' : `Edit ${modal?.name || ''}`}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setModal(null)} disabled={action.pending}>Cancel</button>
            <button form="type-form" type="submit" className="btn-primary" disabled={action.pending}>
              {action.pending ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      >
        <form id="type-form" onSubmit={save} className="space-y-4">
          {action.error && <Alert>{action.error}</Alert>}
          <div className="field">
            <label className="label" htmlFor="t-name">Name *</label>
            <input id="t-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Proof of address" disabled={action.pending} />
          </div>
          <div className="field">
            <label className="label" htmlFor="t-desc">Description</label>
            <textarea id="t-desc" className="input min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={action.pending} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} disabled={action.pending} />
              Required for approval
            </label>
            {modal !== 'create' && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} disabled={action.pending} />
                Active
              </label>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.admin.auditLogs({ page, pageSize: 15 })
      .then((data) => { setLogs(data.logs || []); setPagination(data.pagination || null); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-1">
        <ScrollText className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Append-only record of authentication events and administrative actions</p>

      {error && <Alert className="mb-4">{error}</Alert>}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
        </div>
      ) : logs.length ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Action</th><th>Actor</th><th>Entity</th><th>IP</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="badge badge-neutral">{log.action}</span></td>
                    <td>
                      <p className="font-medium">{log.actor?.name || 'System'}</p>
                      <p className="text-xs text-gray-500">{log.actor?.email}</p>
                    </td>
                    <td className="text-xs text-gray-600">{log.entityType}</td>
                    <td className="text-xs text-gray-500 font-mono">{log.ipAddress || '—'}</td>
                    <td className="text-gray-600">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination {...pagination} onChange={setPage} />
        </>
      ) : (
        <EmptyState icon={ScrollText} title="No audit entries yet" description="Administrative actions and sign-in events will be recorded here." />
      )}
    </div>
  );
}
