"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavUser {
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  brandId?: string;
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Verify", href: "/verify" },
  { label: "For Brands", href: "/brands" },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "All Industries", href: "/industries" },
      { label: "Dairy", href: "/industries/dairy" },
      { label: "Pharmaceuticals", href: "/industries/pharma" },
      { label: "Cosmetics", href: "/industries/cosmetics" },
      { label: "FMCG", href: "/industries/fmcg" },
      { label: "Electronics", href: "/industries/electronics" },
      { label: "Auto Parts", href: "/industries/auto-parts" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [user, setUser] = useState<NavUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Read auth state from localStorage (syncs across tabs + same tab)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('infometa-user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }

    // Listen for storage changes (login/logout in OTHER tabs)
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'infometa-user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch { setUser(null); }
      }
    };

    // Listen for same-tab auth changes (login/logout in THIS tab)
    const authHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUser(detail ?? null);
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('infometa-auth-change', authHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('infometa-auth-change', authHandler);
    };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('infometa-user');
    window.dispatchEvent(new CustomEvent('infometa-auth-change', { detail: null }));
    setUser(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  }

  const dashboardUrl = user?.isSuperAdmin ? '/admin' : '/portal/dashboard';
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-primary" aria-label="Infometa Technologies home">
          <img src="/icon.svg" alt="" width={30} height={30} className="rounded-lg" aria-hidden="true" />
          <span>Infometa</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navItems.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && setDropdownOpen(item.label)}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <Link
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-tint hover:text-foreground"
              >
                {item.label}
                {item.children && <span className="ml-1" aria-hidden="true">▾</span>}
              </Link>
              {item.children && dropdownOpen === item.label && (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-white py-2 shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-secondary hover:bg-surface-tint hover:text-foreground transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/verify">Verify Product</Link>
          </Button>
          {!mounted ? (
            <div className="w-24 h-9" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-border pl-3 pr-1 py-1 hover:bg-surface-tint transition"
              >
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{user.name}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-secondary truncate">{user.email}</p>
                  </div>
                  <Link href={dashboardUrl} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-secondary hover:bg-surface-tint hover:text-foreground transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-secondary hover:text-foreground">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-secondary hover:bg-surface-tint lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t border-border bg-white lg:hidden transition-all overflow-hidden",
          mobileOpen ? "max-h-[80vh] overflow-y-auto" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-secondary hover:bg-surface-tint hover:text-foreground"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-surface-tint"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            <Button variant="secondary" size="md" asChild>
              <Link href="/verify" onClick={() => setMobileOpen(false)}>Verify Product</Link>
            </Button>
            {!mounted ? null : user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{initials}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-secondary truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="primary" size="md" asChild>
                  <Link href={dashboardUrl} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" size="md" onClick={handleLogout} className="text-red-600 hover:bg-red-50 justify-center">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="md" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                </Button>
                <Button variant="primary" size="md" asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
