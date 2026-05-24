'use client';

import { type CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useCreateUser } from '@/hooks/admin/useAdminUsers';
import type { CreateUserInput } from '@/types/admin';
import { inputStyle, labelStyle, ADMIN_ACCENT } from './adminTheme';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  full_name: z.string().min(2, 'Укажите имя'),
  email: z.string().email('Некорректный email'),
  role: z.enum(['student', 'adviser', 'admin']),
  password: z.string().min(8, 'Минимум 8 символов'),
});
type Values = z.infer<typeof schema>;

const errStyle: CSSProperties = { color: 'var(--color-error)', fontSize: 'var(--text-xs)' };

export function UserFormModal({ open, onClose }: Props) {
  const create = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { role: 'student' } });

  if (!open) return null;

  const submit = handleSubmit(async (values) => {
    await create.mutateAsync(values as CreateUserInput);
    reset();
    onClose();
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,26,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>Новый пользователь</h2>
        <p style={{ margin: 'var(--space-2) 0 var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Создание учётной записи с выбранной ролью
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Field label="Полное имя" error={errors.full_name?.message}>
            <input style={inputStyle} {...register('full_name')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input type="email" style={inputStyle} {...register('email')} />
          </Field>
          <Field label="Роль" error={errors.role?.message}>
            <select style={inputStyle} {...register('role')}>
              <option value="student">Студент</option>
              <option value="adviser">Куратор</option>
              <option value="admin">Администратор</option>
            </select>
          </Field>
          <Field label="Временный пароль" error={errors.password?.message}>
            <input type="text" style={inputStyle} {...register('password')} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: ADMIN_ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: create.isPending ? 0.7 : 1 }}
            >
              {create.isPending ? 'Создание…' : 'Создать'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={errStyle}>{error}</span>}
    </div>
  );
}

export default UserFormModal;
