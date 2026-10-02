import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, User, AlertCircle, Upload } from 'lucide-react';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  occupation: '',
  businessInfo: '',
};

export function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dropzoneRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // optional
    return /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.password) {
      setError('Password is required');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.phone && !validatePhone(form.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'confirmPassword' && value) formData.append(key, value);
      });
      documents.forEach((file) => formData.append('documents', file));
      const data = await register(formData);
      if (data.token) {
        navigate('/dashboard');
      } else {
        setSuccess(data.message || 'Registration submitted for review');
        setForm(initialForm);
        setDocuments([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).slice(0, 5);
    setDocuments((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleFileSelect = (e) => {
    setDocuments(Array.from(e.target.files).slice(0, 5));
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Coloan</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Create your profile</h1>
          <p className="mt-2 text-gray-500">Submit your details for administrator review</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="field">
                <label className="label" htmlFor="name">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    className="input pl-10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="email">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    className="input pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="password">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    className="input pl-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-400">Must be at least 8 characters</p>
              </div>
              <div className="field">
                <label className="label" htmlFor="confirmPassword">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="input pl-10"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="input"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  disabled={loading}
                />
              </div>
              <div className="field md:col-span-2">
                <label className="label" htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main Street"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  className="input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="New York"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  className="input"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="NY"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="postalCode">Postal Code</label>
                <input
                  id="postalCode"
                  type="text"
                  className="input"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="10001"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="occupation">Occupation</label>
                <input
                  id="occupation"
                  type="text"
                  className="input"
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  placeholder="Software Engineer"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="businessInfo">Business Info (optional)</label>
                <textarea
                  id="businessInfo"
                  className="input min-h-[100px] resize-y"
                  value={form.businessInfo}
                  onChange={(e) => setForm({ ...form, businessInfo: e.target.value })}
                  placeholder="Business details if self-employed"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Supporting Documents (KYC)</label>
              <div
                ref={dropzoneRef}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                } ${loading ? 'opacity-60' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drag & drop PDF, JPG, or PNG files (max 5, 5MB each)</p>
                <button
                  type="button"
                  className="btn-secondary btn-sm mt-3"
                  onClick={() => dropzoneRef.current?.querySelector('input')?.click()}
                  disabled={loading || documents.length >= 5}
                >
                  Browse files
                </button>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </div>
              {documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {documents.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(i)}
                          className="text-gray-400 hover:text-red-600"
                          aria-label={`Remove ${file.name}`}
                          disabled={loading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-emerald-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}