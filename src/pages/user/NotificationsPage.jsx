import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Bell, BellRing, CheckCheck } from 'lucide-react';
import { Alert, EmptyState, ErrorState, PageLoader, StatCard, useToast } from '../../components/ui';
import { formatDateTime, humanize } from '../../lib/format';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.notifications.list()
      .then((data) => { setNotifications(data.notifications || []); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const markRead = async (notification) => {
    setBusyId(notification.id);
    try {
      await api.notifications.markRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item
      )));
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setBusyId('');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.readAt);
    if (unread.length === 0) return;
    setBusyId('all');
    const results = await Promise.allSettled(unread.map((item) => api.notifications.markRead(item.id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    toast.show(
      failed ? `${unread.length - failed} updated, ${failed} failed.` : `${unread.length} notification(s) marked as read.`,
      failed ? 'error' : 'success',
    );
    load();
    setBusyId('');
  };

  const stats = useMemo(() => {
    const unread = notifications.filter((item) => !item.readAt);
    return { total: notifications.length, unread: unread.length, latest: notifications[0]?.createdAt };
  }, [notifications]);

  if (loading) return <PageLoader cards={3} />;
  if (error && notifications.length === 0) return <ErrorState title="Failed to load notifications" message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Updates on your profile, loans, collateral and payments</p>
        </div>
        <button className="btn-secondary" onClick={markAllRead} disabled={stats.unread === 0 || busyId === 'all'}>
          <CheckCheck className="w-4 h-4" />
          {busyId === 'all' ? 'Updating...' : 'Mark all as read'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Bell} label="Total Notifications" value={stats.total} color="bg-gray-100 text-gray-600" />
        <StatCard icon={BellRing} label="Unread" value={stats.unread} color="bg-amber-100 text-amber-600" />
        <StatCard icon={Bell} label="Most Recent" value={stats.latest ? formatDateTime(stats.latest) : '—'} color="bg-blue-100 text-blue-600" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Updates</h2>
        {error && <Alert className="mb-4">{error}</Alert>}
        {notifications.length ? (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${notification.readAt ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50/40'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className="badge badge-neutral">{humanize(notification.type)}</span>
                      {!notification.readAt && <span className="badge badge-success">New</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!notification.readAt && (
                      <button
                        className="text-xs font-medium text-emerald-700 hover:underline"
                        onClick={() => markRead(notification)}
                        disabled={busyId === notification.id}
                      >
                        {busyId === notification.id ? 'Saving...' : 'Mark read'}
                      </button>
                    )}
                    <Link to="/loans" className="text-xs font-medium text-gray-700 hover:underline">View</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll be notified here when your profile is reviewed, a loan decision is made, or a payment is reconciled."
          />
        )}
      </div>
    </div>
  );
}
