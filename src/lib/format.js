const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const currencyCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function formatCurrency(value, cents = false) {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return cents ? currencyCents.format(amount) : currency.format(amount);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

/** `COLLATERAL_VERIFICATION` -> `Collateral verification` */
export function humanize(value) {
  if (!value) return '';
  const text = String(value).replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatBytes(bytes) {
  if (!Number.isFinite(Number(bytes))) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function daysUntil(value) {
  if (!value) return null;
  const diff = (new Date(value).getTime() - Date.now()) / 86400000;
  return Number.isFinite(diff) ? Math.ceil(diff) : null;
}
