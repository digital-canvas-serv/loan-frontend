import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Bell, ChevronDown, LayoutDashboard, CreditCard, Gem, ReceiptText, FileText, Users, Settings, BarChart2, Shield, ClipboardCheck, WalletCards, FileSearch } from 'lucide-react';

const userNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/loans', label: 'My Loans', icon: CreditCard },
  { to: '/collaterals', label: 'Collaterals', icon: Gem },
  { to: '/repayments', label: 'Repayments', icon: ReceiptText },
  { to: '/profile', label: 'Profile & KYC', icon: User },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/loans', label: 'Loan Applications', icon: CreditCard },
  { to: '/admin/collaterals', label: 'Collaterals', icon: Gem },
  { to: '/admin/payments', label: 'Payments', icon: WalletCards },
  { to: '/admin/documents', label: 'Documents', icon: FileText },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? adminNav : userNav;

  console.log('[Layout] Rendering, user:', user ? { role: user.role, name: user.name } : null, 'path:', location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Coloan</span>
            </div>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="truncate text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-content">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="avatar avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="dropdown">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <NavLink to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </NavLink>
                    <NavLink to="/notifications" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Bell className="w-4 h-4" /> Notifications
                    </NavLink>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item text-red-600 w-full text-left" onClick={logout}>
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}