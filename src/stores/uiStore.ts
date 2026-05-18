import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  notificationDrawerOpen: boolean;
  locale: 'en' | 'ru';
  /** Override label for the last breadcrumb — set by detail pages to show entity name instead of UUID */
  pageTitle: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNotificationDrawer: (open: boolean) => void;
  setLocale: (locale: 'en' | 'ru') => void;
  setPageTitle: (title: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  notificationDrawerOpen: false,
  locale: 'ru',
  pageTitle: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setNotificationDrawer: (open) =>
    set({ notificationDrawerOpen: open }),

  setLocale: (locale) =>
    set({ locale }),

  setPageTitle: (title) =>
    set({ pageTitle: title }),
}));
