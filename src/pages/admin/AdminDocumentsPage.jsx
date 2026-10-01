import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, Download, FileSearch, FileText, RotateCcw, Search, ShieldQuestion } from 'lucide-react';
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
import { formatBytes, formatDate } from '../../lib/format';

export function AdminDocumentsPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.admin.users({ page, pageSize: 20, search })
      .then((data) => {
        setUsers(data.users || []);
        setPagination(data.pagination || null);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(load, [load]);

  const withDocuments = useMemo(() => users.filter((user) => (user._count?.documents ?? 0) > 0), [users]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Review</h1>
          <p className="page-subtitle">Verify identity and ownership documents submitted by applicants</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Applicants Listed" value={pagination?.total ?? users.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={FileSearch} label="With Documents On This Page" value={withDocuments.length} color="bg-purple-100 text-purple-600" />
        <StatCard icon={ShieldQuestion} label="Documents On This Page" value={users.reduce((sum, user) => sum + (user._count?.documents ?? 0), 0)} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Find an applicant by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />)}
          </div>
        ) : users.length ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Account</th>
                    <th>Documents</th>
                    <th>Registered</th>
                    <th className="w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm">{user.name?.[0]?.toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={user.status} kind="account" /></td>
                      <td>{user._count?.documents ?? 0}</td>
                      <td className="text-gray-600">{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className="text-sm font-medium text-emerald-700 hover:underline disabled:text-gray-400 disabled:no-underline"
                          onClick={() => setSelected(user)}
                          disabled={(user._count?.documents ?? 0) === 0}
                        >
                          {(user._count?.documents ?? 0) > 0 ? 'Review' : 'None'}
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
          <EmptyState icon={FileSearch} title="No applicants found" description="Registered applicants and their KYC documents appear here." />
        )}
      </div>

      {selected && <DocumentReviewModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DocumentReviewModal({ user, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [decision, setDecision] = useState('VERIFIED');
  const [reason, setReason] = useState('');
  const action = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.admin.userDocuments(user.id)
      .then((data) => { setDocuments(data.documents || []); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(load, [load]);

  const open = (document) => {
    action.setError('');
    setActive(document);
    setDecision('VERIFIED');
    setReason(document.rejectionReason || '');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (['REJECTED', 'REQUIRES_UPDATE'].includes(decision) && reason.trim().length < 5) {
      action.setError('Give the applicant a reason of at least 5 characters.');
      return;
    }
    const result = await action.run(() => api.admin.reviewDocument(user.id, active.id, {
      status: decision,
      rejectionReason: ['REJECTED', 'REQUIRES_UPDATE'].includes(decision) ? reason.trim() : undefined,
    }));
    if (!result) return;
    toast.show('Document review updated.');
    setActive(null);
    load();
  };

  const counts = useMemo(() => documents.reduce((acc, document) => {
    acc[document.status] = (acc[document.status] || 0) + 1;
    return acc;
  }, {}), [documents]);

  return (
    <Modal open onClose={onClose} title={`KYC documents — ${user.name}`} size="xl">
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />)}
        </div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : documents.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts).map(([status, count]) => (
              <span key={status} className="inline-flex items-center gap-2">
                <StatusBadge status={status} kind="document" />
                <span className="text-xs text-gray-500">{count}</span>
              </span>
            ))}
          </div>

          {documents.map((document) => (
            <div key={document.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{document.filename}</p>
                    <p className="text-xs text-gray-500">
                      {document.type?.name || 'Uncategorised'} · {formatBytes(document.size)} · uploaded {formatDate(document.uploadedAt)}
                    </p>
                    {document.verifiedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">Reviewed {formatDate(document.verifiedAt)}</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={document.status} kind="document" />
              </div>

              {document.rejectionReason && (
                <p className="text-xs text-red-600 mt-2">Reason given: {document.rejectionReason}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <button
                  className="text-xs font-medium text-emerald-700 hover:underline inline-flex items-center gap-1"
                  onClick={() => api.admin.downloadDocument(user.id, document).catch((err) => toast.show(err.message, 'error'))}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button className="text-xs font-medium text-gray-700 hover:underline" onClick={() => open(document)}>
                  Review
                </button>
              </div>

              {active?.id === document.id && (
                <form onSubmit={submit} className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {action.error && <Alert>{action.error}</Alert>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field">
                      <label className="label" htmlFor={`doc-status-${document.id}`}>Outcome</label>
                      <select
                        id={`doc-status-${document.id}`}
                        className="input"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        disabled={action.pending}
                      >
                        <option value="VERIFIED">Verified</option>
                        <option value="UNDER_REVIEW">Under review</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="REQUIRES_UPDATE">Requires update</option>
                      </select>
                    </div>
                    {['REJECTED', 'REQUIRES_UPDATE'].includes(decision) && (
                      <div className="field">
                        <label className="label" htmlFor={`doc-reason-${document.id}`}>Reason (required)</label>
                        <input
                          id={`doc-reason-${document.id}`}
                          className="input"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Shown to the applicant"
                          disabled={action.pending}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="submit" className="btn-primary btn-sm" disabled={action.pending}>
                      {action.pending ? 'Saving...' : 'Save review'}
                    </button>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => setActive(null)} disabled={action.pending}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="No documents uploaded" description="This applicant has not submitted any KYC documents." />
      )}
    </Modal>
  );
}
