'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Roles allowed to access this subtree. Defaults to ['adviser'] to preserve
   * the original adviser-only behaviour. The (admin) group passes ['admin'].
   */
  roles?: string[];
}

export function ProtectedRoute({ children, roles = ['adviser'] }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const pathname = usePathname();

  const roleAllowed = (role?: string) => !!role && roles.includes(role);

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

    if (user && !roleAllowed(user.role)) {
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
  if (!isAuthenticated || (user && !roleAllowed(user.role))) {
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
