'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Monitor } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth, useChangePassword } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useProfile';
import type { NotificationSettingsOut } from '@/types/api';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const sectionStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: '600',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-4)',
};

const formGroupStyle: CSSProperties = {
  marginBottom: 'var(--space-4)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  color: 'var(--color-text-primary)',
};

const inputStyle: CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'inherit',
  color: 'var(--color-text-primary)',
  backgroundColor: 'white',
};

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  justifyContent: 'flex-end',
  marginTop: 'var(--space-4)',
};

const buttonStyle: CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'white',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  transition: 'all 150ms ease',
};

const buttonPrimaryStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--color-primary)',
  color: 'white',
  border: 'none',
};

const infoBoxStyle: CSSProperties = {
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface-hover)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const NOTIFICATION_LABELS: { key: keyof NotificationSettingsOut; label: string; description: string }[] = [
  { key: 'push_enabled', label: 'Push-уведомления', description: 'Получать push-уведомления в браузере' },
  { key: 'email_enabled', label: 'Email-уведомления', description: 'Получать уведомления по электронной почте' },
  { key: 'deadline_alerts', label: 'Напоминания о дедлайнах', description: 'Уведомления за 24 часа до дедлайна задания' },
  { key: 'roadmap_changes', label: 'Изменения в маршрутах', description: 'Уведомления при обновлении маршрутов студентов' },
  { key: 'new_messages', label: 'Новые сообщения', description: 'Уведомления при получении новых сообщений' },
  { key: 'task_updates', label: 'Обновления заданий', description: 'Уведомления при изменении статуса заданий' },
  { key: 'security_alerts', label: 'Уведомления безопасности', description: 'Важные оповещения о безопасности аккаунта' },
  { key: 'app_updates', label: 'Обновления приложения', description: 'Информация о новых функциях и обновлениях' },
];

function NotificationsSection() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  const handleToggle = (key: keyof NotificationSettingsOut, value: boolean) => {
    updateSettings.mutate({ [key]: value });
  };

  const toggleRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)',
  };

  const toggleSwitchStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: 40,
    height: 22,
    flexShrink: 0,
    cursor: updateSettings.isPending ? 'not-allowed' : 'pointer',
  };

  if (isLoading) {
    return (
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Уведомления</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Загрузка…</p>
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Уведомления</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
        Управляйте тем, какие уведомления вы хотите получать.
      </p>
      <div>
        {NOTIFICATION_LABELS.map(({ key, label, description }, idx) => {
          const checked = settings?.[key] ?? false;
          return (
            <div
              key={key}
              style={{
                ...toggleRowStyle,
                borderBottom: idx === NOTIFICATION_LABELS.length - 1 ? 'none' : '1px solid var(--color-border)',
              }}
            >
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {description}
                </div>
              </div>
              {/* Toggle switch */}
              <label style={toggleSwitchStyle} aria-label={label}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={updateSettings.isPending}
                  onChange={(e) => handleToggle(key, e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 9999,
                    background: checked ? 'var(--color-primary, #2563eb)' : '#cbd5e1',
                    transition: 'background 200ms ease',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: checked ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                    transition: 'left 200ms ease',
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateMe, uploadAvatar } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const updateMeMutation = updateMe();
  const uploadAvatarMutation = uploadAvatar();
  const changePasswordMutation = useChangePassword();

  const handleUpdateProfile = () => {
    updateMeMutation.mutate({ full_name: fullName });
  };

  const handleAvatarUpload = async (file: File) => {
    await uploadAvatarMutation.mutateAsync(file);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    if (!oldPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Новый пароль должен быть не менее 8 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    changePasswordMutation.mutate(
      { old_password: oldPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err) => {
          const msg = (err as { message?: string })?.message ?? 'Ошибка при смене пароля';
          setPasswordError(msg);
        },
      },
    );
  };

  return (
    <div style={containerStyle}>
      <PageHeader
        title="Настройки"
        subtitle="Управляйте профилем и безопасностью"
      />

      {/* Profile Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Профиль</h2>
        
        <div style={{ marginBottom: 'var(--space-6)', maxWidth: '200px' }}>
          <ImageUpload
            currentImageUrl={user?.avatar_url}
            onUpload={handleAvatarUpload}
            isUploading={uploadAvatarMutation.isPending}
            label="Аватар профиля"
          />
        </div>

        <div style={infoBoxStyle}>
          Email: {user?.email}
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Полное имя</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
            placeholder="Введите полное имя"
          />
        </div>

        <div style={buttonGroupStyle}>
          <button
            style={buttonPrimaryStyle}
            onClick={handleUpdateProfile}
            disabled={updateMeMutation.isPending}
          >
            {updateMeMutation.isPending ? 'Сохранение...' : 'Сохранить профиль'}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Безопасность</h2>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Текущий пароль</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Новый пароль</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Подтвердите пароль</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            <span style={{ fontSize: 'var(--text-sm)' }}>Показать пароли</span>
          </label>
        </div>

        {passwordError && (
          <div style={{ color: 'var(--color-error, #ef4444)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
            {passwordError}
          </div>
        )}

        <div style={buttonGroupStyle}>
          <button
            style={buttonPrimaryStyle}
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <NotificationsSection />

      {/* Sessions Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Активные сеансы</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Просматривайте и завершайте сеансы на других устройствах.
        </p>
        <Link
          href="/settings/sessions"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8,
            border: '1px solid var(--color-border)', background: 'var(--color-surface-hover)',
            color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 'var(--text-sm)',
            textDecoration: 'none',
          }}
        >
          <Monitor size={15} />
          Управление сеансами
        </Link>
      </div>
    </div>
  );
}
