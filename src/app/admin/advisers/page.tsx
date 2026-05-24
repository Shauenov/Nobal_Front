'use client';

import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdviserCard } from '@/components/admin/AdviserCard';
import { inputStyle } from '@/components/admin/adminTheme';
import { useAdminAdvisers } from '@/hooks/admin/useAdminAdvisers';

const PAGE_SIZE = 12;

export default function AdminAdvisersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminAdvisers({ search: search || undefined, page, page_size: PAGE_SIZE });

  const advisers = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Кураторы"
        subtitle={`${total} куратор${total === 1 ? '' : total < 5 ? 'а' : 'ов'} · нагрузка и рейтинг`}
      />

      <div style={{ position: 'relative', maxWidth: 340 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)', pointerEvents: 'none' }} />
        <input
          placeholder="Поиск куратора…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 200, borderRadius: 12 }} />
          ))}
        </div>
      ) : advisers.length === 0 ? (
        <EmptyState title="Кураторы не найдены" description="Измените запрос поиска" icon={<ShieldCheck size={24} />} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {advisers.map((a, i) => (
              <AdviserCard key={a.user_id} adviser={a} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <span>Страница {page} из {totalPages}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
                >
                  Назад
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
