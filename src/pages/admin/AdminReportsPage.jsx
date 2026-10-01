import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart2, Download, RefreshCw } from 'lucide-react';
import {
  Alert,
  EmptyState,
  PageLoader,
  Pagination,
  StatusBadge,
  useToast,
} from '../../components/ui';
import { formatCurrency, formatDate, humanize } from '../../lib/format';

const reportTypes = [
  { value: 'loans', label: 'Loan Book' },
  { value: 'outstanding', label: 'Outstanding Balances' },
  { value: 'users', label: 'Users' },
  { value: 'kyc', label: 'KYC Submissions' },
  { value: 'payments', label: 'Payments' },
];

export function AdminReportsPage() {
  const [type, setType] = useState('loans');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.admin.reports(type, { page, pageSize: 25, search, status: type === 'payments' ? '' : status, from, to })
      .then((data) => { setReport(data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, page, search, status, from, to]);

  useEffect(load, [load]);

  const changeType = (next) => {
    setType(next);
    setPage(1);
    setStatus('');
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await api.admin.exportReport(type, { search, status: showStatusFilter ? status : '', from, to });
      toast.show('Report exported.');
    } catch (err) {
      toast.show(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const showStatusFilter = ['loans', 'outstanding'].includes(type);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Filter, review and export portfolio data</p>
        </div>
        <button className="btn-primary" onClick={exportCsv} disabled={exporting || loading || (report?.rows?.length ?? 0) === 0}>
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-5">
          {reportTypes.map((option) => (
            <button
              key={option.value}
              onClick={() => changeType(option.value)}
              className={`btn btn-sm ${type === option.value ? 'btn-primary' : 'btn-secondary'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <div className="field">
            <label className="label" htmlFor="r-search">Search</label>
            <input
              id="r-search"
              className="input"
              placeholder={type === 'payments' ? 'Bank reference' : type === 'users' || type === 'kyc' ? 'Name or email' : 'Purpose or borrower'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {showStatusFilter && (
            <div className="field">
              <label className="label" htmlFor="r-status">Status</label>
              <select id="r-status" className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'REJECTED'].map((item) => (
                  <option key={item} value={item}>{humanize(item)}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label className="label" htmlFor="r-from">From</label>
            <input id="r-from" type="date" className="input" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="field">
            <label className="label" htmlFor="r-to">To</label>
            <input id="r-to" type="date" className="input" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        </div>

        {(search || status || from || to) && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">Filters applied</span>
            <button className="btn-ghost btn-sm" onClick={resetFilters}>
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}

        {error && <Alert className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
          </div>
        ) : report?.rows?.length ? (
          <>
            <ReportTable type={type} rows={report.rows} />
            <Pagination {...report.pagination} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            icon={BarChart2}
            title="No data for these filters"
            description="Adjust the filters or clear them to see the full report."
            action={<button className="btn-secondary mt-4" onClick={resetFilters}>Clear filters</button>}
          />
        )}
      </div>
    </div>
  );
}

function ReportTable({ type, rows }) {
  if (type === 'users' || type === 'kyc') {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Documents</th><th>Registered</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="font-medium">{row.name}</td>
                <td className="text-gray-600">{row.email}</td>
                <td><StatusBadge status={row.status} kind="account" /></td>
                <td>{row._count?.documents ?? 0}</td>
                <td className="text-gray-600">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'payments') {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Borrower</th><th>Loan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="font-mono text-xs text-gray-700">{row.referenceId || '—'}</td>
                <td>
                  <p className="font-medium">{row.user?.name}</p>
                  <p className="text-xs text-gray-500">{row.user?.email}</p>
                </td>
                <td className="max-w-[200px] truncate">{row.loan?.purpose || '—'}</td>
                <td className="font-medium">{formatCurrency(row.amount, true)}</td>
                <td>{humanize(row.method)}</td>
                <td><StatusBadge status={row.status} kind="payment" /></td>
                <td className="text-gray-600">{formatDate(row.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'outstanding') {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Borrower</th><th>Purpose</th><th>Status</th><th>Outstanding</th><th>Registered</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                </td>
                <td className="max-w-[240px] truncate">{row.purpose}</td>
                <td><StatusBadge status={row.status} /></td>
                <td className="font-semibold text-gray-900">{formatCurrency(row.outstanding, true)}</td>
                <td className="text-gray-600">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr><th>Borrower</th><th>Purpose</th><th>Collateral</th><th>Amount</th><th>Approved</th><th>Total Payable</th><th>Status</th><th>Registered</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <p className="font-medium">{row.user?.name}</p>
                <p className="text-xs text-gray-500">{row.user?.email}</p>
              </td>
              <td className="max-w-[200px] truncate">{row.purpose}</td>
              <td className="text-sm">
                {row.collateral?.type || '—'}
                {row.collateral?.status && <StatusBadge status={row.collateral.status} kind="collateral" className="ml-2" />}
              </td>
              <td>{formatCurrency(row.amount)}</td>
              <td>{formatCurrency(row.approvedAmount)}</td>
              <td>{formatCurrency(row.totalPayable)}</td>
              <td><StatusBadge status={row.status} /></td>
              <td className="text-gray-600">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
