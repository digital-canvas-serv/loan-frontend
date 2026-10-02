import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Compass, Home, LayoutDashboard, Search } from 'lucide-react';

export function NotFoundPage() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-20 sm:py-28">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Compass className="w-10 h-10 text-emerald-700" />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-emerald-700">Error 404</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          We can't find that page
        </h1>
        <p className="mt-5 text-gray-600 leading-relaxed">
          The page you asked for doesn't exist, or it has moved. Nothing is wrong with your account
          or your loans — you simply followed a link that doesn't lead anywhere.
        </p>

        <p className="mt-6 inline-block px-3 py-1.5 bg-gray-100 rounded-lg font-mono text-xs text-gray-600 break-all">
          {pathname}
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary">
                <LayoutDashboard className="w-4 h-4" /> Go to dashboard
              </Link>
              <Link to="/loans" className="btn-secondary">
                <Search className="w-4 h-4" /> My loans
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                <ArrowLeft className="w-4 h-4" /> Sign in
              </Link>
              <Link to="/register" className="btn-secondary">Create an account</Link>
            </>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 text-left">
          <h2 className="text-sm font-semibold text-gray-900">You might have wanted</h2>
          <ul className="mt-3 space-y-2">
            {[
              { to: '/about', label: 'About Coloan — how collateral-backed lending works' },
              { to: '/privacy', label: 'Privacy Policy — what we collect and why' },
              { to: '/terms', label: 'Terms & Conditions — the rules for every loan' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition-colors">
                  <Home className="w-4 h-4 flex-shrink-0 text-gray-400" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-8 text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to the previous page
        </button>
      </div>
    </section>
  );
}