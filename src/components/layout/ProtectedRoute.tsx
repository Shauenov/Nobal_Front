'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect until Zustand has finished reading from localStorage.
    // Without this guard, the un-hydrated default (isAuthenticated = false)
    // triggers an immediate redirect even for users with a valid session.
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (user && user.role !== 'adviser') {
      router.replace('/login?reason=unauthorized');
    }
  }, [hasHydrated, isAuthenticated, user, router, pathname]);

  // Still hydrating — show spinner but don't redirect yet
  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Hydrated but not authenticated — redirecting (show spinner while navigating)
  if (!isAuthenticated || (user && user.role !== 'adviser')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
