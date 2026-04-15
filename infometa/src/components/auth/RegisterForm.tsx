'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'pharma', label: 'Pharmaceuticals' },
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'agro_products', label: 'Agro Products' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'auto_parts', label: 'Auto Parts' },
  { value: 'lubricants', label: 'Lubricants' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'luxury', label: 'Luxury Goods' },
  { value: 'industrial_chemicals', label: 'Industrial Chemicals' },
];

function PasswordMeter({ password, context }: { password: string; context: string[] }) {
  const checks = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
  const score = checks.filter(c => c.met).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i < score ? colors[score - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.met ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-gray-300" />
            )}
            <span className={check.met ? 'text-green-700' : 'text-gray-400'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    brandName: '', industry: '', website: '', phone: '', country: 'IN',
    ownerName: '', email: '', password: '',
    acceptedTerms: false, acceptedPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'icloud.com', 'yandex.com', 'zoho.com'];

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) setFieldErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function validateField(field: string, value: string): string | null {
    switch (field) {
      case 'phone':
        if (!value) return null; // optional
        if (!/^\+?[0-9]{10,15}$/.test(value.replace(/[\s\-()]/g, '')))
          return 'Enter a valid phone number (10-15 digits, e.g., +91 98765 43210)';
        return null;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        const domain = value.split('@')[1]?.toLowerCase();
        if (FREE_EMAIL_DOMAINS.includes(domain))
          return 'Please use your business email (not ' + domain + ')';
        return null;
      case 'brandName':
        if (value.length < 2) return 'Brand name must be at least 2 characters';
        if (value.length > 100) return 'Brand name must be under 100 characters';
        if (/[<>{}[\]\\]/.test(value)) return 'Brand name contains invalid characters';
        return null;
      case 'website':
        if (!value) return null;
        if (!/^https?:\/\/.+\..+/.test(value)) return 'Enter a valid URL starting with http:// or https://';
        return null;
      case 'ownerName':
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      default: return null;
    }
  }

  function handleBlur(field: string) {
    const value = form[field as keyof typeof form] as string;
    const err = validateField(field, value);
    if (err) setFieldErrors(e => ({ ...e, [field]: err }));
    else setFieldErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || data.details?.fieldErrors?.[Object.keys(data.details?.fieldErrors || {})[0]]?.[0] || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created! You can now sign in.');
      router.push('/login?registered=true');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 1 ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand / Company Name</label>
            <input
              required value={form.brandName}
              onChange={e => update('brandName', e.target.value)}
              onBlur={() => handleBlur('brandName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${fieldErrors.brandName ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Acme Corp"
            />
            {fieldErrors.brandName && <p className="text-xs text-red-600 mt-1">{fieldErrors.brandName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              required value={form.industry} onChange={e => update('industry', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website (optional)</label>
              <input
                type="url" value={form.website} onChange={e => update('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel" value={form.phone}
                onChange={e => update('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="+91 98765 43210"
              />
              {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              required value={form.ownerName} onChange={e => update('ownerName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Email Address</label>
            <input
              type="email" required value={form.email}
              onChange={e => update('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="you@company.com"
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required value={form.password} onChange={e => update('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none pr-12"
                placeholder="Min 12 characters"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <PasswordMeter password={form.password} context={[form.email, form.brandName, form.ownerName]} />
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox" required checked={form.acceptedTerms}
                onChange={e => update('acceptedTerms', e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              I agree to the <a href="/terms" target="_blank" className="text-teal-600 underline hover:text-teal-700">Terms of Service</a>
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox" required checked={form.acceptedPrivacy}
                onChange={e => update('acceptedPrivacy', e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              I agree to the <a href="/privacy" target="_blank" className="text-teal-600 underline hover:text-teal-700">Privacy Policy</a>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button" onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              Create Account
            </button>
          </div>
        </>
      )}
    </form>
  );
}
