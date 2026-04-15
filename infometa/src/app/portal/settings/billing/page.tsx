'use client';

import { usePortalAuth } from '../../layout';
import { CreditCard, Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter', price: 'Free', features: ['100 QR codes/month', '1 team member', 'Basic analytics'],
    current: 'starter',
  },
  {
    name: 'Growth', price: '₹4,999/mo', features: ['10,000 QR codes/month', '5 team members', 'Advanced analytics', 'API access'],
    current: 'growth',
  },
  {
    name: 'Enterprise', price: 'Custom', features: ['Unlimited QR codes', 'Unlimited team', 'Priority support', 'Custom integrations', 'SLA'],
    current: 'enterprise',
  },
];

export default function BillingSettings() {
  const { brand } = usePortalAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = brand?.plan === plan.current;
          return (
            <div key={plan.name} className={`bg-white rounded-xl border-2 p-6 ${
              isCurrent ? 'border-teal-500' : 'border-gray-200'
            }`}>
              {isCurrent && (
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">
                  Current Plan
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 mt-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => window.open(`/contact?subject=${encodeURIComponent('Plan Upgrade: ' + plan.name)}`, '_self')}
                  className="mt-4 w-full border border-teal-600 text-teal-700 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
                >
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
