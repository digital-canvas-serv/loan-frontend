import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Upload, X } from 'lucide-react';
import { humanize } from '../lib/format';

const LOAN_BADGES = {
  DRAFT: 'badge-neutral',
  SUBMITTED: 'badge-processing',
  UNDER_REVIEW: 'badge-processing',
  DOCUMENTS_REQUIRED: 'badge-warning',
  COLLATERAL_VERIFICATION: 'badge-warning',
  PENDING: 'badge-processing',
  APPROVED: 'badge-success',
  DISBURSED: 'badge-success',
  ACTIVE: 'badge-success',
  OVERDUE: 'badge-danger',
  CLOSED: 'badge-neutral',
  CANCELLED: 'badge-neutral',
  PAID: 'badge-success',
  REJECTED: 'badge-danger',
  DEFAULTED: 'badge-danger',
};

const ACCOUNT_BADGES = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  SUSPENDED: 'badge-warning',
  BLOCKED: 'badge-danger',
};

const COLLATERAL_BADGES = {
  PENDING: 'badge-processing',
  VERIFIED: 'badge-success',
  PLEDGED: 'badge-success',
  RELEASED: 'badge-neutral',
  REJECTED: 'badge-danger',
};

const DOCUMENT_BADGES = {
  PENDING: 'badge-warning',
  UNDER_REVIEW: 'badge-processing',
  VERIFIED: 'badge-success',
  REJECTED: 'badge-danger',
  REQUIRES_UPDATE: 'badge-warning',
};

const PAYMENT_BADGES = {
  PENDING: 'badge-warning',
  SUCCESS: 'badge-success',
  FAILED: 'badge-danger',
  REVERSED: 'badge-neutral',
  REFUNDED: 'badge-info',
};

const ROLE_BADGES = {
  USER: 'badge-neutral',
  ADMIN: 'badge-info',
  SUPER_ADMIN: 'badge-info',
};

export const badgeFor = {
  loan: (s) => LOAN_BADGES[s] || 'badge-neutral',
  account: (s) => ACCOUNT_BADGES[s] || 'badge-neutral',
  collateral: (s) => COLLATERAL_BADGES[s] || 'badge-neutral',
  document: (s) => DOCUMENT_BADGES[s] || 'badge-neutral',
  payment: (s) => PAYMENT_BADGES[s] || 'badge-neutral',
  role: (s) => ROLE_BADGES[s] || 'badge-neutral',
};

export function StatusBadge({ status, kind = 'loan', className = '' }) {
  if (!status) return <span className="badge badge-neutral">—</span>;
  return <span className={`badge ${badgeFor[kind] ? badgeFor[kind](status) : 'badge-neutral'} ${className}`}>{humanize(status)}</span>;
}

export function PageLoader({ rows = 3, cards = 0 }) {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
      </div>
      {cards > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-28 bg-gray-200 rounded mt-4" />
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message = '', onRetry }) {
  return (
    <div className="card text-center py-12">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">Try again</button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" />}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  );
}

export function Alert({ tone = 'error', children, className = '' }) {
  const tones = {
    error: 'bg-red-50 text-red-700 border border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  };
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${tones[tone]} ${className}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${width}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ page, pages, total, pageSize, onChange }) {
  if (!page || !pages) return null;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}-{to}</span> of <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          className="btn-secondary btn-sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-gray-600 px-2">Page {page} of {pages}</span>
        <button
          className="btn-secondary btn-sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'bg-emerald-100 text-emerald-600', hint }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`stat-icon ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="stat-label mt-4">{label}</p>
      <p className="stat-value mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

/** Drag-and-drop / browse uploader for PDF, JPEG and PNG files. */
export function FileDropzone({ files, onChange, max = 5, maxSize = 5 * 1024 * 1024, accept = 'application/pdf,image/jpeg,image/png', disabled = false, hint = 'Drag & drop PDF, JPG, or PNG files (max 5, 5MB each)' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const add = (incoming) => {
    const accepted = Array.from(incoming).filter((file) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return false;
      return file.size <= maxSize;
    });
    onChange([...files, ...accepted].slice(0, max));
  };

  const remove = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'} ${disabled ? 'opacity-60' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{hint}</p>
        <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => inputRef.current?.click()} disabled={disabled || files.length >= max}>
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => { add(e.target.files); e.target.value = ''; }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-600" aria-label={`Remove ${file.name}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Transient toast driven by `useToast`. */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = (message, tone = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, tone });
    timer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const element = toast ? (
    <div className={`toast ${toast.tone === 'error' ? 'toast-error' : toast.tone === 'info' ? 'toast-info' : 'toast-success'}`} role="status">
      {toast.tone === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      <span className="text-sm">{toast.message}</span>
    </div>
  ) : null;

  return { show, element };
}

/** Wraps a callback with pending/error state for submit-style actions. */
export function useAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn) => {
    setPending(true);
    setError('');
    try {
      return await fn();
    } catch (err) {
      setError(err.message || 'Request failed');
      return null;
    } finally {
      setPending(false);
    }
  };

  return { run, pending, error, setError };
}
