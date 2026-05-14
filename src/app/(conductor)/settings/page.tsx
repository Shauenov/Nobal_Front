'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';

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

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
    // TODO: Call API to change password
    setPasswordError('Пароль успешно изменён');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          <button style={buttonPrimaryStyle}>
            Сохранить профиль
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
          <button style={buttonPrimaryStyle} onClick={handleChangePassword}>
            Изменить пароль
          </button>
        </div>
      </div>
    </div>
  );
}
