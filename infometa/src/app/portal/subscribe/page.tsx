'use client';

import { usePortalAuth } from '../layout';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter', price: 'Free', period: '14-day trial',
    features: ['100 QR codes/month', '1 team member', 'Basic scan analytics', 'Email support'],
    cta: 'Current Trial', disabled: true, highlight: false,
  },
  {
    name: 'Growth', price: '₹4,999', period: '/month',
    features: ['10,000 QR codes/month', '5 team members', 'Advanced analytics & reports', 'API access', 'Clone detection alerts', 'Priority email support'],
    cta: 'Contact Sales', disabled: false, highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'pricing',
    features: ['Unlimited QR codes', 'Unlimited team members', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-premise option', 'SSO & advanced security'],
    cta: 'Contact Sales', disabled: false, highlight: false,
  },
];

export default function SubscribePage() {
  const { brand } = usePortalAuth();

  const trialEnd = brand?.trialEndsAt ? new Date(brand.trialEndsAt) : null;
  const isExpired = trialEnd && trialEnd < new Date();
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-gray-500 max-w-xl mx-auto">
          Protect your brand with real-time product authentication. All plans include QR code generation, verification tracking, and the Infometa dashboard.
        </p>
        {brand && (
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isExpired ? 'bg-red-100 text-red-700' : brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
          }`}>
            {isExpired ? '⏰ Trial expired' : brand.status === 'active' ? `✓ Active — ${brand.plan} plan` : `⏱ Trial: ${daysLeft} days remaining`}
            {brand.status !== 'active' && trialEnd && (
              <span className="text-xs opacity-70">({trialEnd.toLocaleDateString()})</span>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <div key={plan.name} className={`rounded-2xl border-2 p-6 flex flex-col ${
            plan.highlight ? 'border-teal-500 shadow-lg shadow-teal-100 relative' : 'border-gray-200'
          }`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.disabled ? (
              <div className="mt-6 w-full text-center py-3 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                {brand?.plan === 'starter' ? 'Current Plan' : plan.cta}
              </div>
            ) : (
              <Link
                href={`/contact?subject=${encodeURIComponent('Plan Upgrade: ' + plan.name)}`}
                className={`mt-6 w-full text-center py-3 rounded-lg text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-teal-700 hover:bg-teal-800 text-white'
                    : 'border border-teal-600 text-teal-700 hover:bg-teal-50'
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 max-w-xl mx-auto">
        <p className="font-medium text-gray-700 mb-2">Already purchased?</p>
        <p>If you have received a subscription confirmation, please contact our team to activate your account.</p>
        <Link href="/contact?subject=activation" className="inline-block mt-3 text-teal-600 hover:text-teal-700 font-medium underline">
          Request Activation
        </Link>
      </div>
    </div>
  );
}
