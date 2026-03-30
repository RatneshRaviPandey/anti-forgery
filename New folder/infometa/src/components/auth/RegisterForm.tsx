'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

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

  const [form, setForm] = useState({
    brandName: '', industry: '', website: '', phone: '', country: 'IN',
    ownerName: '', email: '', password: '',
    acceptedTerms: false, acceptedPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
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
              required value={form.brandName} onChange={e => update('brandName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="Acme Corp"
            />
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
                type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="+91..."
              />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email" required value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="you@company.com"
            />
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
              I agree to the Terms of Service
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox" required checked={form.acceptedPrivacy}
                onChange={e => update('acceptedPrivacy', e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              I agree to the Privacy Policy
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
