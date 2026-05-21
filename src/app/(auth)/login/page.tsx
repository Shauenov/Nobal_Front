'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '14px 44px 14px 16px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const iconBtnStyle: CSSProperties = {
  position: 'absolute',
  right: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text-secondary)',
  padding: 0,
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <path d="m2 2 20 20" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <>
    <LoadingOverlay visible={login.isPending} />
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Добро пожаловать Назкен!
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Заполните пожалуйста свои данные
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={inputWrapStyle}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Почта"
            style={inputStyle}
            {...register('email')}
          />
          <span style={{ ...iconBtnStyle, pointerEvents: 'none' }} aria-hidden>
            <MailIcon />
          </span>
        </div>
        {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={inputWrapStyle}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Пароль"
            style={inputStyle}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            style={iconBtnStyle}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <EyeIcon off={!showPassword} />
          </button>
        </div>
        {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--text-sm)',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
          />
          Запомнить меня
        </label>
        <Link href="/forgot-password" style={{ color: 'var(--color-text-secondary)' }}>
          Забыли пароль?
        </Link>
      </div>

      <button
        type="submit"
        disabled={login.isPending}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid transparent',
          padding: '14px 16px',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          color: '#fff',
          background: 'var(--color-primary)',
          opacity: login.isPending ? 0.7 : 1,
        }}
      >
        {login.isPending ? 'Вход...' : 'Войти'}
      </button>
    </form>
    </>
  );
}
