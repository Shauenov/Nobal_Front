import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  notificationDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNotificationDrawer: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  notificationDrawerOpen: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setNotificationDrawer: (open) =>
    set({ notificationDrawerOpen: open }),
}));
