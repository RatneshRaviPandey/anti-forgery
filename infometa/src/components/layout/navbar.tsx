"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary" aria-label="Infometa Technologies home">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#0F766E" />
            <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          <Button variant="primary" size="sm" asChild>
            <Link href="/contact?subject=demo">Book a Demo</Link>
          </Button>
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
          <div className="flex flex-col gap-2 pt-4">
            <Button variant="secondary" size="md" asChild>
              <Link href="/verify">Verify Product</Link>
            </Button>
            <Button variant="primary" size="md" asChild>
              <Link href="/contact?subject=demo">Book a Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
