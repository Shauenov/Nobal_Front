'use client';

import { useMemo, type CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useInviteStudent } from '@/hooks/useStudents';
import type { ApiError, InviteStudentRequest } from '@/types/api';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 15, 26, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 120,
};

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-lg)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-secondary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '10px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

export function InviteModal({ open, onClose }: InviteModalProps) {
  const invite = useInviteStudent();
  const t = useTranslations('students.invite');

  const inviteSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('errors.emailInvalid')),
        full_name: z.string().min(2, t('errors.nameRequired')),
        password: z.string().min(8, t('errors.passwordShort')),
      }),
    [t]
  );

  type InviteValues = z.infer<typeof inviteSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
  });

  if (!open) return null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await invite.mutateAsync(values as InviteStudentRequest);
      reset();
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      console.error(apiErr.message);
    }
  });

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{t('title')}</h2>
          <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="invite-email">
              {t('email')}
            </label>
            <input id="invite-email" type="email" style={inputStyle} {...register('email')} />
            {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="invite-name">
              {t('fullName')}
            </label>
            <input id="invite-name" style={inputStyle} {...register('full_name')} />
            {errors.full_name && <span style={errorStyle}>{errors.full_name.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="invite-password">
              {t('password')}
            </label>
            <input id="invite-password" type="password" style={inputStyle} {...register('password')} />
            {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={invite.isPending}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 'var(--font-semibold)',
                opacity: invite.isPending ? 0.7 : 1,
              }}
            >
              {invite.isPending ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
