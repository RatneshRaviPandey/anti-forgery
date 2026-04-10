"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Layers,
  QrCode,
  ScanLine,
  Bell,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Users,
  Building2,
  KeyRound,
} from "lucide-react";

interface AdminUser {
  id: string; name: string; email: string; role: string; isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<{
  user: AdminUser | null; token: string | null;
}>({ user: null, token: null });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/brand-keys", label: "Brand Keys", icon: KeyRound },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/batches", label: "Batches", icon: Layers },
  { href: "/admin/codes", label: "QR Codes", icon: QrCode },
  { href: "/admin/scans", label: "Scans", icon: ScanLine },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/trust-logs", label: "Trust Logs", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('infometa-token');
    if (!t) { router.push('/login'); return; }
    setToken(t);

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.data.user.isSuperAdmin) {
          router.push('/login');
          return;
        }
        setUser(data.data.user);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('infometa-token');
    localStorage.removeItem('infometa-user');
    document.cookie = 'infometa-session=; path=/; max-age=0';
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
    <AdminAuthContext.Provider value={{ user, token }}>
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
              Super Admin
            </span>
            <button
              className="ml-2 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-secondary hover:bg-surface-tint hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
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
