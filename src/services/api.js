const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

async function downloadFile(path, filename) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Download failed');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },
  dashboard: () => request('/dashboard'),
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },
  profile: {
    get: () => request('/profile'),
    update: (body) => request('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    documentTypes: () => request('/profile/document-types'),
    uploadDocuments: (files, documentTypeId) => {
      const body = new FormData();
      files.forEach((file) => body.append('documents', file));
      if (documentTypeId) body.append('documentTypeId', documentTypeId);
      return request('/profile/documents', { method: 'POST', headers: {}, body });
    },
    downloadDocument: (id, filename = 'document') => downloadFile(`/profile/documents/${id}`, filename),
    uploadPhoto: (file) => {
      const body = new FormData();
      body.append('photo', file);
      return request('/profile/photo', { method: 'POST', headers: {}, body });
    },
  },
  loans: {
    list: (params = {}) => request(`/loans${buildQuery(params)}`),
    get: (id) => request(`/loans/${id}`),
    products: () => request('/loan-products'),
    create: (body) => request('/loans', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    updateStatus: (id, body) => request(`/loans/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  collaterals: {
    list: () => request('/collaterals'),
    create: (body) => request('/collaterals', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, body) => request(`/collaterals/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  repayments: {
    list: (params = {}) => request(`/repayments${buildQuery(params)}`),
    summary: (loanId) => request(`/loans/${loanId}/repayments`),
    createPayment: (body) => request('/payments', { method: 'POST', body: JSON.stringify(body) }),
    receipt: (id) => request(`/payments/${id}/receipt`),
    reconcile: (id, body) => request(`/admin/payments/${id}/reconcile`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    users: (params = {}) => request(`/admin/users${buildQuery(params)}`),
    updateUserStatus: (id, body) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
    blockUser: (id, body = {}) => request(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify(body) }),
    setCredentials: (id, body) => request(`/admin/users/${id}/credentials`, { method: 'POST', body: JSON.stringify(body) }),
    userDocuments: (id) => request(`/admin/users/${id}/documents`),
    downloadDocument: (userId, documentId) => downloadFile(`/admin/users/${userId}/documents/${documentId}`, documentId),
    reviewDocument: (userId, documentId, body) => request(`/admin/users/${userId}/documents/${documentId}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
    documentTypes: () => request('/admin/document-types'),
    createDocumentType: (body) => request('/admin/document-types', { method: 'POST', body: JSON.stringify(body) }),
    updateDocumentType: (id, body) => request(`/admin/document-types/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    auditLogs: (params = {}) => request(`/admin/audit-logs${buildQuery(params)}`),
    reports: (type, params = {}) => request(`/admin/reports${buildQuery({ type, ...params })}`),
    exportReport: (type, params = {}) => downloadFile(`/admin/reports${buildQuery({ type, format: 'csv', ...params })}`, `${type}-report.csv`),
    paymentReports: (params = {}) => request(`/admin/payment-reports${buildQuery(params)}`),
  },
};