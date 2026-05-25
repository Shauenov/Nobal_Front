'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useUniversities, useDeleteUniversity } from '@/hooks/useUniversities';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityCard } from '@/components/universities/UniversityCard';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';

type TabId = 'kz' | 'abroad';

const TABS: { id: TabId; label: string }[] = [
  { id: 'kz',     label: 'В Казахстане' },
  { id: 'abroad', label: 'Заграницей' },
];

export default function UniversitiesPage() {
  const prefix = useRoutePrefix();
  const [activeTab, setActiveTab] = useState<TabId>('kz');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useUniversities({
    page,
    page_size: 12,
    ...(activeTab === 'kz'     ? { country: 'Kazakhstan' } : {}),
    ...(activeTab === 'abroad' ? { is_abroad: true }       : {}),
  });
  const deleteUniversity = useDeleteUniversity();

  const universities = response?.data ?? [];

  const meta = response?.meta;

  const handleDelete = (id: string) => {
    if (confirm('Удалить университет?')) deleteUniversity.mutate(id);
  };

  /* ── Toggle styles ── */
  const toggleWrap: CSSProperties = {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    gap: 2,
    width: 'fit-content',
  };

  const toggleBtn = (active: boolean): CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    background: active ? '#0f172a' : 'transparent',
    color: active ? '#fff' : '#64748b',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  };

  const pageButtonStyle = (active: boolean, disabled?: boolean): CSSProperties => ({
    padding: '7px 12px',
    borderRadius: 8,
    border: active ? 'none' : '1px solid #e2e8f0',
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : '#475569',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
    opacity: disabled ? 0.4 : 1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Каталог вузов"
        subtitle="Управление и редактирование каталога университетов."
        action={
          <Link href={`${prefix}/universities/new`} style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Добавить университет
            </button>
          </Link>
        }
      />

      {/* Toggle + count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={toggleWrap}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={toggleBtn(activeTab === tab.id)}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {meta && (
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {meta.total} университетов
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={gridStyle}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 380,
                borderRadius: 16,
                background: '#f1f5f9',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : universities.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#94a3b8',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏫</div>
          <div style={{ fontWeight: 600, color: '#475569', fontSize: '1rem' }}>
            Нет университетов
          </div>
          <div style={{ fontSize: '0.875rem', marginTop: 4 }}>
            Добавьте первый университет, нажав кнопку выше.
          </div>
        </div>
      ) : (
        <>
          <div style={gridStyle}>
            {universities.map((u) => (
              <UniversityCard
                key={u.id}
                university={u}
                onDelete={() => handleDelete(u.id)}
                isLoading={deleteUniversity.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.total > meta.page_size && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <button
                style={pageButtonStyle(false, page <= 1)}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                ← Назад
              </button>
              {Array.from({ length: Math.ceil(meta.total / meta.page_size) }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button key={p} style={pageButtonStyle(p === page)} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
              <button
                style={pageButtonStyle(false, page >= Math.ceil(meta.total / meta.page_size))}
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(meta.total / meta.page_size)}
              >
                Вперёд →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
