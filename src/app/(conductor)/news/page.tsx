"use client";

import { useState, type CSSProperties } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { AddNewsToCalendarModal } from '@/components/news/AddNewsToCalendarModal';
import { NewsForm } from '@/components/news/NewsForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCreateNews, useNews } from '@/hooks/useNews';
import type { NewsCreate } from '@/types/api';

const pageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const headerActionStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
};

const buttonStyle: CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  color: 'var(--color-text-primary)',
  transition: 'all 150ms ease',
};

const buttonPrimaryStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--color-primary)',
  color: 'white',
  border: 'none',
};

const newsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: 'var(--space-4)',
};

const formContainerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
};

export default function NewsPage() {
  const { data: list } = useNews();
  const create = useCreateNews();
  const [showForm, setShowForm] = useState(false);
  const [activeAddId, setActiveAddId] = useState<string | null>(null);

  const handleCreate = async (payload: NewsCreate) => {
    await create.mutateAsync(payload);
    setShowForm(false);
  };

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="Новости"
        subtitle="Управляйте новостями и событиями колледжа"
      />

      {showForm && (
        <div style={formContainerStyle}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Создать новость
            </h2>
          </div>
          <NewsForm onSubmit={handleCreate} />
        </div>
      )}

      <div style={headerActionStyle}>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={showForm ? buttonStyle : buttonPrimaryStyle}
        >
          {showForm ? 'Отменить' : '+ Новая новость'}
        </button>
      </div>

      {list && list.length > 0 ? (
        <div style={newsGridStyle}>
          {list.map((n) => (
            <NewsCard
              key={n.id}
              news={n}
              onAddToCalendar={() => setActiveAddId(n.id)}
              onTogglePublish={() => {}}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <p style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-2) 0' }}>
            Нет новостей
          </p>
          <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
            Создайте первую новость, нажав на кнопку выше
          </p>
        </div>
      )}

      {activeAddId && (
        <div>
          {(() => {
            const newsItem = list?.find((x) => x.id === activeAddId);
            if (!newsItem) return null;
            return <AddNewsToCalendarModal news={newsItem} onClose={() => setActiveAddId(null)} />;
          })()}
        </div>
      )}
    </div>
  );
}
