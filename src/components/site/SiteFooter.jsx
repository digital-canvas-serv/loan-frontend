import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, MapPin, Phone } from 'lucide-react';

// TODO: replace the placeholder contact details below before going live.
const CONTACT = {
  email: 'support@example.com',
  phone: '+1 (000) 000-0000',
  address: 'Registered office address, City, State, Postal code',
};

const company = [
  { to: '/about', label: 'About Us' },
  { to: '/login', label: 'Sign in' },
  { to: '/register', label: 'Create an account' },
  { to: '/loans/new', label: 'Apply for a loan' },
];

const legal = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
];

export function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="mt-auto bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Coloan</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Asset-backed lending for people and small businesses. Every loan is secured by
              collateral that we physically verify before funds are released.
            </p>
          </div>

          <nav>
            <h2 className="text-sm font-semibold text-white">Company</h2>
            <ul className="mt-4 space-y-3">
              {company.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-emerald-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h2 className="text-sm font-semibold text-white">Legal</h2>
            <ul className="mt-4 space-y-3">
              {legal.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-emerald-400 transition-colors">{label}</Link>
                </li>
              ))}
              {user && (
                <>
                  <li><Link to="/admin/settings" className="text-sm hover:text-emerald-400 transition-colors">Audit trail</Link></li>
                  <li><Link to="/profile" className="text-sm hover:text-emerald-400 transition-colors">Your documents</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-emerald-400 transition-colors break-all">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`} className="hover:text-emerald-400 transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="leading-relaxed">{CONTACT.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            &copy; {new Date().getFullYear()} Coloan. All rights reserved. Lending is subject to
            identity verification, collateral appraisal and approval. Figures shown on this site
            are illustrative and do not constitute a credit offer &mdash; the binding terms for
            each loan are set out in your approval letter and the Terms &amp; Conditions.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <Link to="/privacy" className="text-gray-500 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-emerald-400 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/about" className="text-gray-500 hover:text-emerald-400 transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}