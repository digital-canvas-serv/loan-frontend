import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Shield, LayoutDashboard, LogOut } from 'lucide-react';

const links = [
  { to: '/about', label: 'About Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
];

export function SiteHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile panel whenever the route changes.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Harbor</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary btn-sm">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={logout} className="btn-ghost btn-sm" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn-primary btn-sm">Create account</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-200 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-primary w-full">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={logout} className="btn-secondary w-full">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary w-full">Create account</Link>
                  <Link to="/login" className="btn-secondary w-full">Sign in</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}