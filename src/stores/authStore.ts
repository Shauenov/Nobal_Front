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
  // Lazy initializer: immediately true if Zustand already hydrated before this mount
  // Always start false so the server and the first client render agree
  // ("Verifying session..."). useEffect only runs on the client, so it
  // won't fire during SSR and won't cause a hydration mismatch.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Subscribe first so we don't miss the event if hydration finishes
    // between the subscription and our microtask check.
    const unsub = useAuthStore.persist?.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // If persist already finished (localStorage is synchronous, so this is
    // the common case), flip on the next microtask to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    queueMicrotask(() => {
      if (useAuthStore.persist?.hasHydrated()) setHasHydrated(true);
    });

    return unsub;
  }, []);

  return hasHydrated;
}
