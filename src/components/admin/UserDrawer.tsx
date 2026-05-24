'use client';

import { type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, KeyRound, Power, Trash2, Mail, Calendar, Clock, type LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { AdminUser, Role } from '@/types/admin';
import { RoleBadge } from './RoleBadge';
import { StatusPill } from './StatusPill';
import { ADMIN_ACCENT, inputStyle, labelStyle } from './adminTheme';
import { useSetUserActive, useUpdateUserRole, useDeleteAdminUser } from '@/hooks/admin/useAdminUsers';

interface Props {
  user: AdminUser | null;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

export function UserDrawer({ user, onClose }: Props) {
  const updateRole = useUpdateUserRole();
  const setActive = useSetUserActive();
  const remove = useDeleteAdminUser();

  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: 420,
              height: '100vh',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* header */}
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-full)',
                  background: `color-mix(in srgb, ${ADMIN_ACCENT} 14%, transparent)`,
                  color: ADMIN_ACCENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(user.full_name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>{user.full_name}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <RoleBadge role={user.role} />
                  <StatusPill active={user.is_active} />
                </div>
              </div>
              <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Calendar} label="Создан" value={format(new Date(user.created_at), 'dd MMMM yyyy')} />
              <InfoRow icon={Clock} label="Последний вход" value={user.last_login_at ? format(new Date(user.last_login_at), 'dd MMMM yyyy') : 'никогда'} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={labelStyle}>Роль</label>
                <select
                  style={inputStyle}
                  value={user.role}
                  disabled={updateRole.isPending}
                  onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as Role })}
                >
                  <option value="student">Студент</option>
                  <option value="adviser">Куратор</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>

            {/* footer actions */}
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button style={actionBtn} onClick={() => toast.success('Ссылка для сброса пароля отправлена (демо)')}>
                <KeyRound size={16} /> Сбросить пароль
              </button>
              <button
                style={actionBtn}
                disabled={setActive.isPending}
                onClick={() => setActive.mutate({ id: user.id, is_active: !user.is_active })}
              >
                <Power size={16} color={user.is_active ? 'var(--color-warning)' : 'var(--color-success)'} />
                {user.is_active ? 'Деактивировать аккаунт' : 'Активировать аккаунт'}
              </button>
              <button
                style={{ ...actionBtn, color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)' }}
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(`Удалить ${user.full_name}?`)) {
                    remove.mutate(user.id, { onSuccess: onClose });
                  }
                }}
              >
                <Trash2 size={16} /> Удалить пользователя
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const actionBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  cursor: 'pointer',
};

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ color: 'var(--color-text-disabled)' }}>
        <Icon size={16} />
      </span>
      <div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

export default UserDrawer;
