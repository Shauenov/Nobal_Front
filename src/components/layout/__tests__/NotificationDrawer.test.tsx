import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotificationDrawer } from '../NotificationDrawer';

const setNotificationDrawer = vi.fn();
let notificationDrawerOpen = false;

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    notificationDrawerOpen,
    setNotificationDrawer,
  }),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({ data: { data: [] } }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
}));

describe('NotificationDrawer', () => {
  beforeEach(() => {
    setNotificationDrawer.mockClear();
  });

  it('does not render when closed', () => {
    notificationDrawerOpen = false;
    const { container } = render(<NotificationDrawer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the drawer when open', () => {
    notificationDrawerOpen = true;

    render(<NotificationDrawer />);

    expect(screen.getByText('Уведомления')).toBeInTheDocument();
    expect(screen.getByText('У вас нет уведомлений')).toBeInTheDocument();
  });
});
