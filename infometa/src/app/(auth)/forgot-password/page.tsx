'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production, this would call /api/auth/forgot-password
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h2>
        <p className="text-gray-500 mb-8">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
        </p>
        <Link
          href="/login"
          className="block w-full text-center bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg transition"
        >
          Return to Sign In
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
      <p className="text-gray-500 mb-8">Enter your email and we&apos;ll send reset instructions.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="you@company.com"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={20} className="animate-spin" />}
          Send Reset Link
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
