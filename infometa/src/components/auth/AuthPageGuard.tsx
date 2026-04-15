'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects already-logged-in users away from auth pages (login/register).
 * Checks localStorage for user data (set during login).
 */
export function AuthPageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('infometa-user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Redirect to appropriate dashboard
        if (user.isSuperAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/portal/dashboard');
        }
        return;
      } catch { /* invalid data, allow access */ }
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
      </div>
    );
  }

  return <>{children}</>;
}
