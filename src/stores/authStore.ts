import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserBrief } from '@/types/api';

interface AuthState {
  user: UserBrief | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: UserBrief, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  updateUser: (user: Partial<UserBrief>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearSession: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (partial) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        }));
      },
    }),
    {
      name: 'nobal-auth',
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Returns true once Zustand has finished reading from localStorage.
 * Use this to avoid redirect loops caused by the initial un-hydrated state.
 */
export function useHasHydrated() {
  // Always start false so the server and the first client render agree
  // ("Verifying session..."). useEffect only runs on the client, so it
  // won't fire during SSR and won't cause a hydration mismatch.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // 1) Synchronous check — localStorage is synchronous, so by the time this
    //    effect runs the store has almost always already hydrated. This is the
    //    common case and resolves immediately.
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
      return;
    }

    // 2) Otherwise subscribe to the finish-hydration event.
    const unsub = useAuthStore.persist?.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // 3) Safety fallback: never let the "Verifying session..." spinner hang
    //    forever if the hydration event was missed for any reason.
    const fallback = setTimeout(() => setHasHydrated(true), 1000);

    return () => {
      unsub?.();
      clearTimeout(fallback);
    };
  }, []);

  return hasHydrated;
}
