'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Layers, QrCode, BarChart3, Bell,
  FileText, Settings, Users, Key, Shield, CreditCard,
  Menu, X, LogOut, ChevronDown,
} from 'lucide-react';

interface UserInfo {
  id: string; name: string; email: string; role: string; brandId: string;
  mfaEnabled: boolean;
}
interface BrandInfo {
  id: string; name: string; logo: string | null; plan: string;
  status: string; trialEndsAt: string | null; isActive: boolean;
}

const AuthContext = createContext<{
  user: UserInfo | null; brand: BrandInfo | null; token: string | null;
}>({ user: null, brand: null, token: null });

export function usePortalAuth() {
  return useContext(AuthContext);
}

// Role-based menu visibility: which roles can see which menu items
const ROLE_ACCESS: Record<string, string[]> = {
  '/portal/dashboard':    ['owner', 'admin', 'analyst', 'viewer'],
  '/portal/products':     ['owner', 'admin', 'analyst'],
  '/portal/batches':      ['owner', 'admin', 'analyst'],
  '/portal/scans':        ['owner', 'admin', 'analyst'],
  '/portal/alerts':       ['owner', 'admin', 'analyst'],
  '/portal/reports':      ['owner', 'admin', 'analyst'],
  '/portal/settings':     ['owner', 'admin'],
  '/portal/settings/team':     ['owner'],
  '/portal/settings/api-keys': ['owner', 'admin'],
  '/portal/settings/security': ['owner', 'admin'],
  '/portal/settings/billing':  ['owner'],
};

const NAV_ITEMS = [
  { href: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portal/products',  icon: Package,         label: 'Products' },
  { href: '/portal/batches',   icon: Layers,          label: 'Batches' },
  { href: '/portal/scans',     icon: QrCode,          label: 'Scans' },
  { href: '/portal/alerts',    icon: Bell,            label: 'Alerts' },
  { href: '/portal/reports',   icon: FileText,        label: 'Reports' },
];

const SETTINGS_ITEMS = [
  { href: '/portal/settings',          icon: Settings, label: 'General' },
  { href: '/portal/settings/team',     icon: Users,    label: 'Team' },
  { href: '/portal/settings/api-keys', icon: Key,      label: 'API Keys' },
  { href: '/portal/settings/security', icon: Shield,   label: 'Security' },
  { href: '/portal/settings/billing',  icon: CreditCard, label: 'Billing' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/portal/settings'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token is in httpOnly cookie — sent automatically with fetch
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.success) { router.push('/login'); return; }
        setUser(data.data.user);
        setBrand(data.data.brand);
        setToken('cookie'); // marker — actual token is in httpOnly cookie
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    localStorage.removeItem('infometa-user');
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
      </div>
    );
  }

  // ─── Subscription Gate ─────────────────────────────────────
  const isTrialExpired = brand?.status === 'trial' && brand?.trialEndsAt && new Date(brand.trialEndsAt) < new Date();
  const isInactive = brand?.status === 'suspended' || brand?.status === 'churned';
  const isPending = brand?.status === 'pending_verification';

  if (isTrialExpired || isInactive || isPending) {
    const trialEnd = brand?.trialEndsAt ? new Date(brand.trialEndsAt) : null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          {isTrialExpired && (
            <>
              <div className="text-5xl mb-4">⏰</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Trial Period Expired</h1>
              <p className="text-gray-500 mb-2">
                Your 14-day free trial ended on <strong>{trialEnd?.toLocaleDateString()}</strong>.
              </p>
              <p className="text-gray-500 mb-6">
                Subscribe to continue using the Infometa platform for your brand <strong>{brand?.name}</strong>.
              </p>
            </>
          )}
          {isInactive && (
            <>
              <div className="text-5xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h1>
              <p className="text-gray-500 mb-6">
                Your account for <strong>{brand?.name}</strong> has been {brand?.status === 'suspended' ? 'suspended' : 'deactivated'}.
                Please contact support to reactivate.
              </p>
            </>
          )}
          {isPending && (
            <>
              <div className="text-5xl mb-4">📋</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h1>
              <p className="text-gray-500 mb-6">
                Your brand <strong>{brand?.name}</strong> is being verified. This usually takes 1-2 business days.
                We&apos;ll notify you at <strong>{user?.email}</strong> once approved.
              </p>
            </>
          )}
          <div className="flex flex-col gap-3">
            {isTrialExpired && (
              <a href="/portal/subscribe" className="inline-flex items-center justify-center bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 px-6 rounded-lg transition">
                View Plans & Subscribe
              </a>
            )}
            <a href="/contact?subject=support" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition">
              Contact Support
            </a>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 mt-2">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate trial days remaining for active trials
  const trialDaysLeft = brand?.status === 'trial' && brand?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(brand.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <AuthContext.Provider value={{ user, brand, token }}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-teal-700" />
              <span className="font-bold text-gray-900">Infometa</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Brand info + subscription status */}
          {brand && (
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{brand.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-teal-600 capitalize">{brand.plan} plan</span>
                {trialDaysLeft !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    trialDaysLeft <= 3 ? 'bg-red-100 text-red-700' : trialDaysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {trialDaysLeft}d left
                  </span>
                )}
                {brand.status === 'active' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                )}
              </div>
            </div>
          )}

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.filter(item => {
              const allowed = ROLE_ACCESS[item.href];
              return !allowed || allowed.includes(user?.role ?? 'viewer');
            }).map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href} href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            {/* Settings group */}
            <div className="pt-3">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                <span className="flex items-center gap-3">
                  <Settings size={18} />
                  Settings
                </span>
                <ChevronDown size={16} className={`transition ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {SETTINGS_ITEMS.filter(item => {
                    const allowed = ROLE_ACCESS[item.href];
                    return !allowed || allowed.includes(user?.role ?? 'viewer');
                  }).map(item => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href} href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                          active
                            ? 'bg-teal-50 text-teal-700 font-medium'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User info + logout */}
          <div className="border-t border-gray-200 p-4">
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition w-full px-2 py-1.5"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-6">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="flex-1" />
            {user && (
              <span className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full font-medium capitalize">
                {user.role}
              </span>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
