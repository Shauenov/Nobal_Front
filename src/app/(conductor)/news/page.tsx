"use client";

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewsForm } from '@/components/news/NewsForm';
import { AddNewsToCalendarModal } from '@/components/news/AddNewsToCalendarModal';
import { useNews, useCreateNews, useDeleteNews, useToggleNewsPublished } from '@/hooks/useNews';
import type { NewsCreate, NewsOut } from '@/types/api';

type Tab = 'all' | 'published' | 'draft';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Все Новости' },
  { id: 'published', label: 'Опубликованные' },
  { id: 'draft', label: 'Черновики' },
];

export default function NewsPage() {
  const { data: list = [] } = useNews();
  const createNews = useCreateNews();
  const deleteNews = useDeleteNews();
  const togglePublished = useToggleNewsPublished();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsOut | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = list;
    if (activeTab === 'published') items = items.filter((n) => n.is_published);
    if (activeTab === 'draft') items = items.filter((n) => !n.is_published);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.body ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [list, activeTab, search]);

  const handleCreate = async (payload: NewsCreate) => {
    await createNews.mutateAsync(payload);
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить новость?')) deleteNews.mutate(id);
  };

  /* ── Styles ── */
  const tabBarStyle: CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #e8ecf0',
    gap: 0,
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '10px 18px',
    border: 'none',
    borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
    background: 'transparent',
    color: active ? '#2563eb' : '#64748b',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    marginBottom: -1,
  });

  const thStyle: CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: '#f8fafc',
    borderBottom: '1px solid #e8ecf0',
  };

  const tdStyle: CSSProperties = {
    padding: '12px 14px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.875rem',
    color: '#1e293b',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Новости"
        subtitle="Управляйте новостями и событиями"
        action={
          <button
            onClick={() => { setEditItem(null); setShowForm((s) => !s); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
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
            <Plus size={16} />
            Новость
          </button>
        }
      />

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            {editItem ? 'Редактировать новость' : 'Создать новость'}
          </div>
          <NewsForm
            onSubmit={handleCreate}
            initial={editItem ?? undefined}
          />
        </div>
      )}

      {/* Search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            placeholder="Поиск новостей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              color: '#1e293b',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Table card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8ecf0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
        }}
      >
        {/* Tabs */}
        <div style={tabBarStyle}>
          {TABS.map((tab) => (
            <button key={tab.id} style={tabStyle(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 60 }}></th>
              <th style={thStyle}>Заголовок</th>
              <th style={{ ...thStyle, width: 130 }}>Дата</th>
              <th style={{ ...thStyle, width: 130 }}>Статус</th>
              <th style={{ ...thStyle, width: 110 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>
                  Нет новостей
                </td>
              </tr>
            ) : (
              filtered.map((news) => (
                <tr key={news.id} style={{ transition: 'background 150ms ease' }}>
                  {/* Thumbnail */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        width: 48,
                        height: 36,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#f1f5f9',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      {news.cover_url ? (
                        <Image
                          src={news.cover_url}
                          alt={news.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>
                          📰
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Title */}
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: 2 }}>
                      {news.title}
                    </div>
                    {news.body && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 340 }}>
                        {news.body.slice(0, 80)}
                        {news.body.length > 80 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  {/* Date */}
                  <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.8rem' }}>
                    {format(new Date(news.event_date ?? news.created_at), 'dd MMM yyyy', { locale: ru })}
                  </td>
                  {/* Status */}
                  <td style={tdStyle}>
                    <button
                      onClick={() => togglePublished.mutate({ id: news.id, is_published: !news.is_published })}
                      style={{
                        padding: '3px 12px',
                        borderRadius: 9999,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: news.is_published ? '#dcfce7' : '#fef3c7',
                        color: news.is_published ? '#15803d' : '#92400e',
                      }}
                    >
                      {news.is_published ? 'ОПУБЛИКОВАН' : 'ЧЕРНОВИК'}
                    </button>
                  </td>
                  {/* Actions */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        title="Добавить в календарь"
                        onClick={() => setCalendarId(news.id)}
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', borderRadius: 6 }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        title="Редактировать"
                        onClick={() => { setEditItem(news); setShowForm(true); }}
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', borderRadius: 6 }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Удалить"
                        onClick={() => handleDelete(news.id)}
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', borderRadius: 6 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar modal */}
      {calendarId && (() => {
        const newsItem = list.find((x) => x.id === calendarId);
        if (!newsItem) return null;
        return <AddNewsToCalendarModal news={newsItem} onClose={() => setCalendarId(null)} />;
      })()}
    </div>
  );
}
