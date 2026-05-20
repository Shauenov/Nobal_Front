import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SettingsPage from '../page';

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
  ),
}));

vi.mock('@/components/ui/ImageUpload', () => ({
  ImageUpload: ({ label }: { label: string }) => <div data-testid="image-upload">{label}</div>,
}));

const mockUpdateMe = vi.fn();
const mockUploadAvatar = vi.fn();
const mockChangePassword = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u-1', full_name: 'Asel Nurova', email: 'asel@nobal.kz', role: 'conductor', avatar_url: null },
    updateMe: () => ({ mutate: mockUpdateMe, isPending: false }),
    uploadAvatar: () => ({ mutateAsync: mockUploadAvatar, isPending: false }),
  }),
  useChangePassword: () => ({ mutate: mockChangePassword, isPending: false }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useNotificationSettings: () => ({
    data: {
      push_enabled: true,
      email_enabled: false,
      deadline_alerts: true,
      roadmap_changes: false,
      new_messages: true,
      task_updates: true,
      security_alerts: true,
      app_updates: false,
    },
    isLoading: false,
  }),
  useUpdateNotificationSettings: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mockUpdateMe.mockReset();
    mockUploadAvatar.mockReset();
  });

  it('renders the settings page with profile and security sections', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Безопасность')).toBeInTheDocument();
    expect(screen.getByText('Email: asel@nobal.kz')).toBeInTheDocument();
  });

  it('shows avatar upload component', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('image-upload')).toHaveTextContent('Аватар профиля');
  });

  it('shows password mismatch error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    // [0] = current password, [1] = new password, [2] = confirm password
    await user.type(passwordInputs[0], 'oldpass123');
    await user.type(passwordInputs[1], 'newpass123');
    await user.type(passwordInputs[2], 'differentpass');

    await user.click(screen.getByRole('button', { name: 'Изменить пароль' }));

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
  });
});
