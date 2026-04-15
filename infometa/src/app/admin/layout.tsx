"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Layers, QrCode, ScanLine, Bell, BarChart3,
  Settings, Shield, LogOut, Menu, X, Users, Building2, KeyRound,
  MessageSquare, Radio, ShieldCheck, ChevronDown, ArrowLeft, GitCompare,
} from "lucide-react";

interface AdminUser {
  id: string; name: string; email: string; role: string; isSuperAdmin: boolean;
}
interface BrandOption {
  id: string; name: string; plan: string; status: string;
}

const AdminAuthContext = createContext<{
  user: AdminUser | null; token: string | null; selectedBrand: BrandOption | null;
}>({ user: null, token: null, selectedBrand: null });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

// Platform-level nav (always visible)
const platformNav = [
  { href: "/admin", label: "Platform Dashboard", icon: LayoutDashboard },
  { href: "/admin/live-feed", label: "Live Feed", icon: Radio },
  { href: "/admin/brands", label: "All Brands", icon: Building2 },
  { href: "/admin/users", label: "All Users", icon: Users },
  { href: "/admin/admin-users", label: "Admin Users", icon: ShieldCheck },
  { href: "/admin/compare", label: "Compare Brands", icon: GitCompare },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/trust-logs", label: "Trust Logs", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Brand-scoped nav (visible when a brand is selected)
const brandNav = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/batches", label: "Batches", icon: Layers },
  { href: "/admin/codes", label: "QR Codes", icon: QrCode },
  { href: "/admin/scans", label: "Scans", icon: ScanLine },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/brand-keys", label: "Brand Keys", icon: KeyRound },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    // Token is in httpOnly cookie — sent automatically with fetch
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.data.user.isSuperAdmin) {
          router.push('/login');
          return;
        }
        setUser(data.data.user);
        setToken('cookie');
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));

    // Load brands list for context switcher
    fetch('/api/superadmin/brands?limit=100', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setBrands(d.data); })
      .catch(() => {});
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

  return (
    <AdminAuthContext.Provider value={{ user, token, selectedBrand }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Infometa</span>
            <span className="ml-auto rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Admin
            </span>
            <button className="ml-2 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Brand Context Switcher */}
          <div className="border-b border-border p-3">
            {selectedBrand ? (
              <div className="rounded-lg bg-teal-50 border border-teal-200 p-2.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-teal-600 font-medium">Viewing Brand</p>
                    <p className="text-sm font-bold text-teal-800 truncate">{selectedBrand.name}</p>
                  </div>
                  <button onClick={() => setSelectedBrand(null)} className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-100" title="Back to all brands">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-surface-tint">
                  <span className="text-secondary">All Brands</span>
                  <ChevronDown size={16} className="text-secondary" />
                </button>
                {brandDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {brands.map(b => (
                      <button key={b.id} onClick={() => { setSelectedBrand(b); setBrandDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-surface-tint border-b border-border/30 last:border-0">
                        <span className="font-medium text-foreground">{b.name}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          b.status === 'active' ? 'bg-green-100 text-green-700' :
                          b.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        )}>{b.status}</span>
                      </button>
                    ))}
                    {brands.length === 0 && <p className="p-3 text-xs text-secondary">No brands found</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {/* Platform Navigation */}
            <p className="text-[10px] uppercase tracking-wider text-secondary font-semibold mb-2 px-3">Platform</p>
            <ul className="space-y-1 mb-4">
              {platformNav.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setSidebarOpen(false)}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-secondary hover:bg-surface-tint hover:text-foreground"
                      )}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Brand-Scoped Navigation (visible when brand selected) */}
            {selectedBrand && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-teal-600 font-semibold mb-2 px-3">{selectedBrand.name}</p>
                <ul className="space-y-1">
                  {brandNav.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={() => setSidebarOpen(false)}
                          className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive ? "bg-teal-50 text-teal-700" : "text-secondary hover:bg-surface-tint hover:text-foreground"
                          )}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {!selectedBrand && (
              <div className="mt-2 rounded-lg border border-dashed border-border p-3 text-center">
                <p className="text-xs text-secondary">Select a brand above to view its products, batches, scans, and reports.</p>
              </div>
            )}
          </nav>

          {/* User info + logout */}
          <div className="border-t border-border p-4">
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">
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
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-surface-tint hover:text-foreground w-full"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 items-center gap-4 border-b border-border bg-white px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">
                  Super Admin
                </span>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}
