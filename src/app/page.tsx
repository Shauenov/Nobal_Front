'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { goToAdminHome } from '@/lib/adminUrl';

export default function Home() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.role === 'admin') {
      goToAdminHome((p) => router.replace(p));
    } else {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
