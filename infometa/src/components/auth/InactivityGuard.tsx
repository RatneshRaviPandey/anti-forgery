'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000;       // Show warning 2 minutes before logout
const CHECK_INTERVAL = 60 * 1000;            // Check every 60 seconds

/**
 * Monitors user activity (mouse, keyboard, touch, scroll).
 * Auto-logs out after 30 minutes of inactivity.
 * Shows a warning toast 2 minutes before auto-logout.
 */
export function InactivityGuard() {
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  const performLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('infometa-user');
    window.dispatchEvent(new CustomEvent('infometa-auth-change', { detail: null }));
    toast.error('Session expired due to inactivity. Please sign in again.');
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Only activate if user is logged in
    const stored = localStorage.getItem('infometa-user');
    if (!stored) return;

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));

    // Periodic check for inactivity
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= INACTIVITY_TIMEOUT) {
        clearInterval(interval);
        performLogout();
        return;
      }

      if (elapsed >= INACTIVITY_TIMEOUT - WARNING_BEFORE && !warningShownRef.current) {
        warningShownRef.current = true;
        toast('Your session will expire in 2 minutes due to inactivity.', {
          icon: '⏰',
          duration: 10000,
        });
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [updateActivity, performLogout]);

  return null; // This is a behavior-only component, no UI
}
