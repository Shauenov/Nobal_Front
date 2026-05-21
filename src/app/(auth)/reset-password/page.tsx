'use client';

import { Suspense, useRef, useState } from 'react';
import type { ClipboardEvent, CSSProperties, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const resetSchema = z
  .object({
    otp: z.string().length(6, 'Введите 6-значный код'),
    new_password: z.string().min(8, 'Не менее 8 символов'),
    confirm_password: z.string().min(8, 'Не менее 8 символов'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  });

type ResetValues = z.infer<typeof resetSchema>;

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '14px 44px 14px 16px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const reset = useResetPassword();

  const [apiError, setApiError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '' },
  });

  const updateOtp = (next: string[]) => {
    setOtpDigits(next);
    setValue('otp', next.join(''), { shouldValidate: true });
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    updateOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill('').map((_, i) => text[i] ?? '');
    updateOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await reset.mutateAsync({ email, otp: values.otp, new_password: values.new_password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setApiError(message);
    }
  });

  return (
    <>
    <LoadingOverlay visible={reset.isPending} />
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Новый пароль
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Код отправлен на <strong>{email}</strong>
        </p>
      </div>

      {/* OTP boxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Код подтверждения
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-hover)',
                textAlign: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                padding: 0,
              }}
              aria-label={`Цифра ${index + 1}`}
            />
          ))}
        </div>
        <input type="hidden" {...register('otp')} />
        {errors.otp && <span style={errorStyle}>{errors.otp.message}</span>}
      </div>

      {/* New password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="new_password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Новый пароль"
            style={inputStyle}
            {...register('new_password')}
          />
          <button type="button" onClick={() => setShowNew(v => !v)}
            style={{ position: 'absolute', right: 14, background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', display: 'flex' }}
            aria-label="Показать/скрыть пароль">
            <EyeIcon off={!showNew} />
          </button>
        </div>
        {errors.new_password && <span style={errorStyle}>{errors.new_password.message}</span>}
      </div>

      {/* Confirm password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Повторите пароль"
            style={inputStyle}
            {...register('confirm_password')}
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            style={{ position: 'absolute', right: 14, background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', display: 'flex' }}
            aria-label="Показать/скрыть пароль">
            <EyeIcon off={!showConfirm} />
          </button>
        </div>
        {errors.confirm_password && <span style={errorStyle}>{errors.confirm_password.message}</span>}
      </div>

      {apiError && (
        <div style={{ border: '1px solid var(--color-error)', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={reset.isPending}
        style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: 'none', padding: '14px 16px', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: '#fff', background: 'var(--color-primary)', opacity: reset.isPending ? 0.7 : 1 }}
      >
        {reset.isPending ? 'Сохранение...' : 'Сохранить пароль'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        <a href="/forgot-password" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>
          Отправить код повторно
        </a>
      </div>
    </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
