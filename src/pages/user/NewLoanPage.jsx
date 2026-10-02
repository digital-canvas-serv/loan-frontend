import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, ArrowRight, Upload, AlertCircle, Shield, X } from 'lucide-react';

const initialForm = {
  loanProductId: '',
  requestedAmount: '',
  requestedTenureMonths: '',
  purpose: '',
  repaymentPreference: 'MONTHLY',
  collateralType: 'Gold/Jewellery',
  itemName: '',
  collateralDescription: '',
  quantity: '1',
  weight: '',
  declaredValue: '',
  ownershipInformation: '',
};

const collateralTypes = ['Gold/Jewellery', 'Electronics', 'Vehicle', 'Other eligible assets'];
const repaymentPreferences = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'BIWEEKLY', label: 'Biweekly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'BULLET', label: 'Bullet Repayment' },
];

export function NewLoanPage() {
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dropzoneRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.loans.products()
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message));
  }, []);

  const product = products.find((p) => p.id === form.loanProductId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.loanProductId || !form.requestedAmount || !form.requestedTenureMonths || !form.purpose) {
      setError('Please fill in all required loan fields');
      return;
    }
    if (!form.itemName || !form.collateralDescription || !form.declaredValue || !form.ownershipInformation) {
      setError('Please fill in all required collateral fields');
      return;
    }
    if (files.length === 0) {
      setError('At least one collateral document is required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') formData.append(key, value);
      });
      files.forEach((file) => formData.append('evidence', file));

      await api.loans.create(formData);
      navigate('/loans');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key, value) => setForm({ ...form, [key]: value });

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
    const newFiles = Array.from(e.dataTransfer.files).slice(0, 5);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files).slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <Link to="/loans" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <div>
          <p className="text-sm text-gray-500">New Application</p>
          <h1 className="page-title">Request a New Loan</h1>
          <p className="page-subtitle">Your collateral details will be reviewed by our team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Loan Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field md:col-span-2">
              <label className="label">Loan Product *</label>
              <select
                className="input"
                value={form.loanProductId}
                onChange={(e) => setField('loanProductId', e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select a loan product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {product && (
              <div className="md:col-span-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">{product.description || 'Configured product'}</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Term: {product.minTermMonths}-{product.maxTermMonths} months · Rate from {product.baseRate}%
                </p>
              </div>
            )}

            <div className="field">
              <label className="label">Requested Amount *</label>
              <input
                type="number"
                className="input"
                value={form.requestedAmount}
                onChange={(e) => setField('requestedAmount', e.target.value)}
                min={product?.minAmount || 1}
                max={product?.maxAmount}
                placeholder="10000"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label className="label">Requested Tenure (months) *</label>
              <select
                className="input"
                value={form.requestedTenureMonths}
                onChange={(e) => setField('requestedTenureMonths', e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">Select tenure</option>
                {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>

            <div className="field md:col-span-2">
              <label className="label">Purpose *</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                placeholder="What will the funds be used for?"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label className="label">Repayment Preference</label>
              <select
                className="input"
                value={form.repaymentPreference}
                onChange={(e) => setField('repaymentPreference', e.target.value)}
                disabled={submitting}
              >
                {repaymentPreferences.map((rp) => (
                  <option key={rp.value} value={rp.value}>{rp.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Collateral Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field">
              <label className="label">Collateral Type *</label>
              <select
                className="input"
                value={form.collateralType}
                onChange={(e) => setField('collateralType', e.target.value)}
                required
                disabled={submitting}
              >
                {collateralTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Item Name *</label>
              <input
                type="text"
                className="input"
                value={form.itemName}
                onChange={(e) => setField('itemName', e.target.value)}
                placeholder="e.g., 2019 Toyota Corolla"
                required
                disabled={submitting}
              />
            </div>

            <div className="field md:col-span-2">
              <label className="label">Description *</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={form.collateralDescription}
                onChange={(e) => setField('collateralDescription', e.target.value)}
                placeholder="Condition, model, identifying details"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label className="label">Quantity *</label>
              <input
                type="number"
                step="0.001"
                className="input"
                value={form.quantity}
                onChange={(e) => setField('quantity', e.target.value)}
                min="0.001"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label className="label">Weight (optional)</label>
              <input
                type="number"
                step="0.001"
                className="input"
                value={form.weight}
                onChange={(e) => setField('weight', e.target.value)}
                min="0"
                placeholder="Optional"
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label className="label">Declared Value *</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.declaredValue}
                onChange={(e) => setField('declaredValue', e.target.value)}
                min="0.01"
                placeholder="25000"
                required
                disabled={submitting}
              />
            </div>

            <div className="field md:col-span-2">
              <label className="label">Ownership Information *</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={form.ownershipInformation}
                onChange={(e) => setField('ownershipInformation', e.target.value)}
                placeholder="How do you own this asset?"
                required
                disabled={submitting}
              />
            </div>

            <div className="field md:col-span-2">
              <label className="label">Photos & Supporting Documents *</label>
              <div
                ref={dropzoneRef}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                } ${submitting ? 'opacity-60' : ''}`}
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
                  disabled={submitting || files.length >= 5}
                >
                  Browse files
                </button>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={submitting}
                />
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-gray-400 hover:text-red-600"
                          aria-label={`Remove ${file.name}`}
                          disabled={submitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/loans" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}