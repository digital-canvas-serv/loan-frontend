import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Camera, Download, FileText, KeyRound, Shield } from 'lucide-react';
import {
  Alert,
  EmptyState,
  ErrorState,
  FileDropzone,
  Modal,
  PageLoader,
  StatusBadge,
  useAction,
  useToast,
} from '../../components/ui';
import { formatBytes, formatDate } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

const fields = [
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
  { key: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main Street' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'postalCode', label: 'Postal Code', type: 'text' },
  { key: 'occupation', label: 'Occupation', type: 'text' },
];

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ name: '', businessInfo: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const profileAction = useAction();

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const uploadAction = useAction();

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const passwordAction = useAction();

  const load = async () => {
    try {
      const [profileData, typeData] = await Promise.all([api.profile.get(), api.profile.documentTypes()]);
      const next = profileData.profile;
      setProfile(next);
      setTypes(typeData.types || []);
      setForm({
        name: next.name || '',
        businessInfo: next.businessInfo || '',
        dateOfBirth: toDateInput(next.dateOfBirth),
        phone: next.phone || '',
        address: next.address || '',
        city: next.city || '',
        state: next.state || '',
        postalCode: next.postalCode || '',
        occupation: next.occupation || '',
      });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const result = await profileAction.run(() => api.profile.update({
      name: form.name,
      businessInfo: form.businessInfo,
      dateOfBirth: form.dateOfBirth || '',
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      occupation: form.occupation,
    }));
    if (!result) return;
    setProfile(result.profile);
    updateUser({ ...profile, ...result.profile });
    toast.show('Profile updated.');
  };

  const upload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      uploadAction.setError('Select at least one document to upload.');
      return;
    }
    const body = new FormData();
    files.forEach((file) => body.append('documents', file));
    if (documentTypeId) body.append('documentTypeId', documentTypeId);
    const result = await uploadAction.run(() => api.profile.uploadDocuments(files, documentTypeId));
    if (!result) return;
    toast.show(`${result.documents.length} document(s) submitted for review.`);
    setFiles([]);
    setDocumentTypeId('');
    load();
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    const body = new FormData();
    body.append('photo', file);
    const result = await profileAction.run(() => api.profile.uploadPhoto(body));
    if (!result) return;
    toast.show('Profile photo uploaded for review.');
    load();
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      passwordAction.setError('New passwords do not match.');
      return;
    }
    const result = await passwordAction.run(() => api.auth.changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    }));
    if (!result) return;
    toast.show('Password changed. Please sign in again.');
    setShowPassword(false);
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (loading) return <PageLoader cards={2} rows={4} />;
  if (error) return <ErrorState title="Failed to load your profile" message={error} onRetry={load} />;

  const documents = profile.documents || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile &amp; KYC</h1>
          <p className="page-subtitle">Keep your details and identity documents current</p>
        </div>
        <StatusBadge status={profile.status} kind="account" className="px-3 py-1" />
      </div>

      {profile.status === 'PENDING' && (
        <Alert tone="warning">
          Your profile is awaiting administrator review. You will be able to sign in once it is approved.
          {profile.reviewNote && <span className="block mt-1">Note: {profile.reviewNote}</span>}
        </Alert>
      )}
      {['REJECTED', 'SUSPENDED', 'BLOCKED'].includes(profile.status) && profile.reviewNote && (
        <Alert>{profile.reviewNote}</Alert>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 mb-6 border-b border-gray-200">
          <div className="avatar avatar-lg">{profile.name?.[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {formatDate(profile.createdAt)}</p>
          </div>
          <div className="sm:ml-auto">
            <label className="btn-secondary btn-sm cursor-pointer">
              <Camera className="w-4 h-4" />
              {profileAction.pending ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                disabled={profileAction.pending}
                onChange={(e) => { uploadPhoto(e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5">
          {profileAction.error && <Alert>{profileAction.error}</Alert>}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field">
              <label className="label" htmlFor="p-name">Full Name</label>
              <input id="p-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={profileAction.pending} />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-email">Email</label>
              <input id="p-email" className="input bg-gray-50" value={profile.email} disabled />
            </div>
            {fields.map((field) => (
              <div className="field" key={field.key}>
                <label className="label" htmlFor={`p-${field.key}`}>{field.label}</label>
                <input
                  id={`p-${field.key}`}
                  type={field.type}
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  disabled={profileAction.pending}
                />
              </div>
            ))}
            <div className="field md:col-span-2">
              <label className="label" htmlFor="p-business">Business Information</label>
              <textarea id="p-business" className="input min-h-[100px] resize-y" value={form.businessInfo} onChange={(e) => setForm({ ...form, businessInfo: e.target.value })} placeholder="Optional — business details if self-employed" disabled={profileAction.pending} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={profileAction.pending}>
              {profileAction.pending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Identity Documents</h2>
          <p className="text-sm text-gray-500 mb-4">Stored privately and reviewed by administrators only</p>
          {documents.length ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{document.filename}</p>
                        <p className="text-xs text-gray-500">
                          {document.type?.name || 'Uncategorised'} · {formatBytes(document.size)} · {formatDate(document.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={document.status} kind="document" />
                  </div>
                  {document.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2">Action needed: {document.rejectionReason}</p>
                  )}
                  <button
                    className="text-xs font-medium text-emerald-700 hover:underline mt-2 inline-flex items-center gap-1"
                    onClick={() => api.profile.downloadDocument(document.id, document.filename).catch((err) => toast.show(err.message, 'error'))}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No documents uploaded" description="Upload at least one identity or ownership document to complete verification." />
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
            <form onSubmit={upload} className="space-y-4">
              {uploadAction.error && <Alert>{uploadAction.error}</Alert>}
              <div className="field">
                <label className="label" htmlFor="doc-type">Document Type</label>
                <select id="doc-type" className="input" value={documentTypeId} onChange={(e) => setDocumentTypeId(e.target.value)} disabled={uploadAction.pending}>
                  <option value="">Uncategorised</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}{type.required ? ' (required)' : ''}</option>
                  ))}
                </select>
              </div>
              <FileDropzone files={files} onChange={setFiles} disabled={uploadAction.pending} />
              <button type="submit" className="btn-primary w-full" disabled={uploadAction.pending}>
                {uploadAction.pending ? 'Uploading...' : 'Upload for Review'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <KeyRound className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">Change password</p>
                  <p className="text-sm text-gray-500">Passwords must be at least 8 characters</p>
                </div>
              </div>
              <button className="btn-secondary btn-sm flex-shrink-0" onClick={() => setShowPassword(true)}>Change</button>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              Documents are stored as encrypted database records and served only to you and reviewing administrators.
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showPassword}
        onClose={() => setShowPassword(false)}
        title="Change password"
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setShowPassword(false)} disabled={passwordAction.pending}>Cancel</button>
            <button form="password-form" type="submit" className="btn-primary" disabled={passwordAction.pending}>
              {passwordAction.pending ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
      >
        <form id="password-form" onSubmit={changePassword} className="space-y-4">
          {passwordAction.error && <Alert>{passwordAction.error}</Alert>}
          <div className="field">
            <label className="label" htmlFor="cur-pw">Current Password</label>
            <input id="cur-pw" type="password" className="input" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} disabled={passwordAction.pending} />
          </div>
          <div className="field">
            <label className="label" htmlFor="new-pw">New Password</label>
            <input id="new-pw" type="password" className="input" minLength={8} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} disabled={passwordAction.pending} />
          </div>
          <div className="field">
            <label className="label" htmlFor="conf-pw">Confirm New Password</label>
            <input id="conf-pw" type="password" className="input" minLength={8} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} disabled={passwordAction.pending} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
