import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Ban, FileText, KeyRound, Search, Shield, Users } from 'lucide-react';
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
import { formatDate, humanize } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLOCKED'];

export function AdminUsersPage() {
  console.log('[AdminUsersPage] Component function called');
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [review, setReview] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [decision, setDecision] = useState('APPROVED');
  const [credentials, setCredentials] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [documents, setDocuments] = useState(null);
  const reviewAction = useAction();
  const credentialsAction = useAction();
  const toast = useToast();

  const load = useCallback(() => {
    console.log('[AdminUsersPage] load() called, page:', page, 'search:', search, 'status:', status);
    setLoading(true);
    api.admin.users({ page, pageSize: 20, search, status })
      .then((data) => {
        console.log('[AdminUsersPage] API success:', data);
        setUsers(data.users || []);
        setPagination(data.pagination || null);
        setError('');
      })
      .catch((err) => {
        console.error('[AdminUsersPage] API error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => {
    console.log('[AdminUsersPage] useEffect triggered, load:', load);
    load();
  }, [load]);

  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (status) next.status = status;
    setSearchParams(next, { replace: true });
  }, [search, status]);

  const openReview = (row) => {
    reviewAction.setError('');
    setReview(row);
    setReviewNote(row.reviewNote || '');
    setDecision('APPROVED');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const result = await reviewAction.run(() => api.admin.updateUserStatus(review.id, {
      status: decision,
      reviewNote: reviewNote.trim() || undefined,
    }));
    if (!result) return;
    toast.show(result.message || 'Account review updated.');
    setReview(null);
    load();
  };

  const blockUser = async (row) => {
    const result = await reviewAction.run(() => api.admin.blockUser(row.id, { reviewNote: reviewNote.trim() || undefined }));
    if (!result) return;
    toast.show('Account blocked.');
    setReview(null);
    load();
  };

  const submitCredentials = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      credentialsAction.setError('A new password of at least 8 characters is required.');
      return;
    }
    const result = await credentialsAction.run(() => api.admin.setCredentials(credentials.id, { password: newPassword }));
    if (!result) return;
    toast.show(result.message || 'Credentials activated.');
    setCredentials(null);
    setNewPassword('');
    load();
  };

  const openDocuments = async (row) => {
    const result = await reviewAction.run(() => api.admin.userDocuments(row.id));
    if (!result) return;
    setDocuments({ user: row, documents: result.documents || [] });
  };

  const downloadDocument = (userId, document) => {
    api.admin.downloadDocument(userId, document.id)
      .catch((err) => toast.show(err.message, 'error'));
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Approve applicants and manage account access</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input sm:w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
          </select>
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
                    <th>Role</th>
                    <th>Status</th>
                    <th>Documents</th>
                    <th>Loans</th>
                    <th>Registered</th>
                    <th className="w-40"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm">{row.name?.[0]?.toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{row.name}</p>
                            <p className="text-xs text-gray-500 truncate">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={row.role} kind="role" /></td>
                      <td><StatusBadge status={row.status} kind="account" /></td>
                      <td>{row._count?.documents ?? 0}</td>
                      <td>{row._count?.loans ?? 0}</td>
                      <td className="text-gray-600">{formatDate(row.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <button className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => openReview(row)}>
                            Review
                          </button>
                          <button className="text-sm font-medium text-gray-700 hover:underline" onClick={() => openDocuments(row)}>
                            KYC
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
          <EmptyState icon={Users} title="No users found" description={search || status ? 'Try adjusting your search or status filter.' : 'No accounts have registered yet.'} />
        )}
      </div>

      <Modal
        open={Boolean(review)}
        onClose={() => setReview(null)}
        title={review ? `Review ${review.name}` : ''}
        size="lg"
        footer={(
          <>
            {review && review.status !== 'BLOCKED' && isSuperAdmin && (
              <button className="btn-danger mr-auto" onClick={() => blockUser(review)} disabled={reviewAction.pending}>
                <Ban className="w-4 h-4" /> Block account
              </button>
            )}
            <button className="btn-secondary" onClick={() => setReview(null)} disabled={reviewAction.pending}>Cancel</button>
            <button form="review-form" type="submit" className="btn-primary" disabled={reviewAction.pending}>
              {reviewAction.pending ? 'Saving...' : 'Apply decision'}
            </button>
          </>
        )}
      >
        {review && (
          <form id="review-form" onSubmit={submitReview} className="space-y-5">
            {reviewAction.error && <Alert>{reviewAction.error}</Alert>}

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Email" value={review.email} />
              <Info label="Registered" value={formatDate(review.createdAt)} />
              <Info label="Phone" value={review.phone || '—'} />
              <Info label="Date of Birth" value={formatDate(review.dateOfBirth)} />
              <Info label="Occupation" value={review.occupation || '—'} />
              <Info label="Current status" value={humanize(review.status)} />
              <Info label="Documents" value={review._count?.documents ?? 0} />
              <Info label="Loans" value={review._count?.loans ?? 0} />
            </div>

            {(review.address || review.businessInfo) && (
              <div className="space-y-2 text-sm">
                {review.address && <Info label="Address" value={[review.address, review.city, review.state, review.postalCode].filter(Boolean).join(', ')} />}
                {review.businessInfo && <Info label="Business" value={review.businessInfo} />}
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <Shield className="w-4 h-4 flex-shrink-0" />
              Review the applicant's KYC documents before approving. Approving activates sign-in for the account.
            </div>

            <div className="field">
              <label className="label" htmlFor="review-status">Decision</label>
              <select id="review-status" className="input" value={decision} onChange={(e) => setDecision(e.target.value)} disabled={reviewAction.pending}>
                <option value="APPROVED">Approve — activate account</option>
                <option value="REJECTED">Reject</option>
                <option value="SUSPENDED">Suspend</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="review-note">Review Note</label>
              <textarea
                id="review-note"
                className="input min-h-[90px] resize-y"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Shared with the applicant via notifications"
                disabled={reviewAction.pending}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => { setReview(null); credentialsAction.setError(''); setCredentials(review); setNewPassword(''); }}
              >
                <KeyRound className="w-4 h-4" /> Set a new password instead
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(credentials)}
        onClose={() => setCredentials(null)}
        title={credentials ? `Set password for ${credentials.name}` : ''}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setCredentials(null)} disabled={credentialsAction.pending}>Cancel</button>
            <button form="credentials-form" type="submit" className="btn-primary" disabled={credentialsAction.pending}>
              {credentialsAction.pending ? 'Saving...' : 'Activate credentials'}
            </button>
          </>
        )}
      >
        <form id="credentials-form" onSubmit={submitCredentials} className="space-y-4">
          {credentialsAction.error && <Alert>{credentialsAction.error}</Alert>}
          <div className="field">
            <label className="label" htmlFor="new-password">New Password</label>
            <input id="new-password" type="text" className="input" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" disabled={credentialsAction.pending} />
          </div>
          <Alert tone="warning">Share this password with the applicant through a secure channel. Every action here is written to the audit log.</Alert>
        </form>
      </Modal>

      <Modal open={Boolean(documents)} onClose={() => setDocuments(null)} title={documents ? `KYC documents — ${documents.user.name}` : ''} size="xl">
        {documents?.documents.length ? (
          <div className="space-y-3">
            {documents.documents.map((document) => (
              <div key={document.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{document.filename}</p>
                      <p className="text-xs text-gray-500">
                        {document.type?.name || 'Uncategorised'} · {document.mimeType} · uploaded {formatDate(document.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={document.status} kind="document" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button className="text-xs font-medium text-emerald-700 hover:underline" onClick={() => downloadDocument(documents.user.id, document)}>
                    Download
                  </button>
                  <Link to="/admin/documents" className="text-xs font-medium text-gray-700 hover:underline">
                    Open review queue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="No documents uploaded" description="This applicant has not submitted any KYC documents yet." />
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right break-words">{value}</span>
    </div>
  );
}
