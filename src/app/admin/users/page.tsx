'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Search, UserPlus, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserDrawer } from '@/components/admin/UserDrawer';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { ADMIN_ACCENT, inputStyle } from '@/components/admin/adminTheme';
import { useAdminUsers, useSetUserActive, useDeleteAdminUser } from '@/hooks/admin/useAdminUsers';
import type { AdminUser, Role } from '@/types/admin';

type SortBy = 'full_name' | 'created_at' | 'role';
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const params = useMemo(
    () => ({ search, role, status, sort_by: sortBy, sort_dir: sortDir, page, page_size: PAGE_SIZE }),
    [search, role, status, sortBy, sortDir, page]
  );

  const { data, isLoading, isFetching } = useAdminUsers(params);
  const setActive = useSetUserActive();
  const remove = useDeleteAdminUser();

  const users = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSort = (col: SortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = (u: AdminUser) => {
    if (window.confirm(`Удалить ${u.full_name}?`)) remove.mutate(u.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Пользователи"
        subtitle={`Всего: ${total} · управление аккаунтами и ролями`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => setCreateOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: ADMIN_ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
            >
              <UserPlus size={16} /> Создать
            </button>
          </div>
        }
      />

      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
          <input
            placeholder="Поиск по имени или email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
          <SlidersHorizontal size={16} />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value as Role | 'all'); setPage(1); }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">Все роли</option>
          <option value="student">Студенты</option>
          <option value="adviser">Кураторы</option>
          <option value="admin">Админы</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as 'all' | 'active' | 'inactive'); setPage(1); }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">Любой статус</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 64, borderRadius: 12 }} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="Пользователи не найдены" description="Измените фильтры или создайте нового пользователя" icon={<UserPlus size={24} />} />
      ) : (
        <div style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 150ms ease' }}>
          <UsersTable
            users={users}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onView={setSelected}
            onToggleActive={(u) => setActive.mutate({ id: u.id, is_active: !u.is_active })}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        <span>Страница {page} из {totalPages}</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={pageBtn(page <= 1)}>Назад</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={pageBtn(page >= totalPages)}>Вперёд</button>
        </div>
      </div>

      <UserDrawer user={selected} onClose={() => setSelected(null)} />
      <UserFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const pageBtn = (disabled: boolean): CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-secondary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});
