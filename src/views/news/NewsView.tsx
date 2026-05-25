"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Search, Plus, Pencil, Trash2, X, Calendar, ExternalLink, Eye, ChevronDown } from 'lucide-react';
import { NewsForm } from '@/components/news/NewsForm';
import { AddNewsToCalendarModal } from '@/components/news/AddNewsToCalendarModal';
import { useNews, useCreateNews, useUpdateNews, useDeleteNews, useToggleNewsPublished } from '@/hooks/useNews';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import apiClient from '@/lib/apiClient';
import type { NewsCreate, NewsOut } from '@/types/api';

type Tab = 'all' | 'published' | 'draft';
type SortKey = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'event_date';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',       label: 'Все Новости' },
  { id: 'published', label: 'Опубликованные' },
  { id: 'draft',     label: 'Черновики' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',     label: 'Сначала новые' },
  { value: 'oldest',     label: 'Сначала старые' },
  { value: 'event_date', label: 'По дате события' },
  { value: 'title_asc',  label: 'Название А → Я' },
  { value: 'title_desc', label: 'Название Я → А' },
];

const CATEGORY_FILTERS: { value: string; label: string; emoji: string }[] = [
  { value: 'all',             label: 'Все',            emoji: '📋' },
  { value: 'olympiad',        label: 'Олимпиады',      emoji: '🏆' },
  { value: 'hackathon',       label: 'Хакатоны',       emoji: '💻' },
  { value: 'deadline',        label: 'Дедлайны',       emoji: '⏰' },
  { value: 'webinar',         label: 'Вебинары',       emoji: '🎙️' },
  { value: 'internship',      label: 'Стажировки',     emoji: '💼' },
  { value: 'summer_camp',     label: 'Летний лагерь',  emoji: '🏕️' },
  { value: 'university_news', label: 'Новости вузов',  emoji: '🏫' },
  { value: 'general',         label: 'Общее',          emoji: '📰' },
];

const CATEGORY_LABELS: Record<string, string> = {
  olympiad:        'Олимпиада',
  hackathon:       'Хакатон',
  deadline:        'Дедлайн',
  summer_camp:     'Летний лагерь',
  webinar:         'Вебинар',
  internship:      'Стажировка',
  university_news: 'Новости университета',
  announcement:    'Объявление',
  general:         'Общее',
};

const PAGE_SIZE = 10;

/* ── Status toggle ── */
function StatusToggle({
  isPublished, isPending, onToggle,
}: {
  isPublished: boolean;
  isPending: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showPublished = hovered ? !isPublished : isPublished;
  const bg    = showPublished ? '#dcfce7' : '#fef3c7';
  const color = showPublished ? '#15803d' : '#a16207';
  const label = showPublished ? 'ОПУБЛИКОВАН' : 'ЧЕРНОВИК';
  const hint  = isPublished   ? '→ В черновик' : '→ Опубликовать';

  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={hint}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 12px', borderRadius: 9999,
        border: hovered ? `1.5px solid ${color}` : '1.5px solid transparent',
        cursor: isPending ? 'not-allowed' : 'pointer',
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
        background: bg, color,
        transition: 'all 150ms', opacity: isPending ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {hovered && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{isPublished ? '↓' : '↑'}</span>}
      {label}
    </button>
  );
}

/* ── News preview side panel ── */
function NewsPreviewPanel({
  news,
  onClose,
  onEdit,
  onCalendar,
}: {
  news: NewsOut;
  onClose: () => void;
  onEdit: () => void;
  onCalendar: () => void;
}) {
  const categoryLabel = CATEGORY_LABELS[news.category] ?? news.category;

  return (
    <div
      style={{
        width: 380,
        flexShrink: 0,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 160px)',
        position: 'sticky',
        top: 20,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Превью</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onEdit}
            title="Редактировать"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 7,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Pencil size={13} />
            Изменить
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: 7, cursor: 'pointer', color: '#94a3b8',
              display: 'flex', alignItems: 'center', padding: '6px 7px',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover image */}
        {news.cover_url ? (
          <div style={{ width: '100%', height: 180, position: 'relative', flexShrink: 0 }}>
            <Image
              src={news.cover_url}
              alt={news.title}
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{
            width: '100%', height: 120,
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            📰
          </div>
        )}

        <div style={{ padding: '16px' }}>
          {/* Category + status badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px', borderRadius: 9999,
              background: '#eff6ff', color: '#2563eb',
              fontSize: '0.72rem', fontWeight: 600,
            }}>
              {categoryLabel}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 9999,
              background: news.is_published ? '#dcfce7' : '#fef3c7',
              color: news.is_published ? '#15803d' : '#a16207',
              fontSize: '0.72rem', fontWeight: 600,
            }}>
              {news.is_published ? 'Опубликована' : 'Черновик'}
            </span>
            {news.allow_calendar && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999,
                background: '#eff6ff', color: '#2563eb',
                fontSize: '0.72rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Calendar size={11} />
                В календарь
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.4 }}>
            {news.title}
          </h3>

          {/* Date */}
          <div style={{ fontSize: '0.77rem', color: '#94a3b8', marginBottom: 12 }}>
            {news.event_date
              ? `📅 ${format(new Date(news.event_date), 'd MMMM yyyy', { locale: ru })}`
              : `🕐 ${format(new Date(news.created_at), 'd MMMM yyyy', { locale: ru })}`}
          </div>

          {/* Body */}
          <div style={{
            fontSize: '0.83rem', color: '#475569', lineHeight: 1.65,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {news.body}
          </div>

          {/* External URL */}
          {news.external_url && (
            <a
              href={news.external_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 14, fontSize: '0.78rem', color: '#2563eb',
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              <ExternalLink size={13} />
              Открыть источник
            </a>
          )}
        </div>
      </div>

      {/* Footer: Add to calendar */}
      {news.allow_calendar && (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button
            onClick={onCalendar}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 9, border: 'none',
              background: '#2563eb', color: '#fff',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Calendar size={15} />
            Добавить в календарь
          </button>
        </div>
      )}
    </div>
  );
}

const thStyle: CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: '0.7rem', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase',
  letterSpacing: '0.08em', background: '#f8fafc',
  borderBottom: '1px solid #e8ecf0', whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  padding: '13px 16px', verticalAlign: 'middle',
  borderBottom: '1px solid #f8fafc',
  fontSize: '0.875rem', color: '#1e293b',
};

export default function NewsPage() {
  const qc = useQueryClient();
  const { data: list = [] } = useNews();
  const createNews      = useCreateNews();
  const deleteNews      = useDeleteNews();
  const togglePublished = useToggleNewsPublished();

  const [activeTab,      setActiveTab]      = useState<Tab>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortKey,        setSortKey]        = useState<SortKey>('newest');
  const [sortOpen,       setSortOpen]       = useState(false);
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);
  const [showForm,       setShowForm]       = useState(false);
  const [editItem,       setEditItem]       = useState<NewsOut | null>(null);
  const [previewItem,    setPreviewItem]    = useState<NewsOut | null>(null);
  const [calendarId,     setCalendarId]     = useState<string | null>(null);

  const updateNews = useUpdateNews(editItem?.id ?? '');

  // Close sort dropdown on outside click
  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let items = [...(list ?? [])];

    // Tab filter
    if (activeTab === 'published') items = items.filter((n) => n.is_published);
    if (activeTab === 'draft')     items = items.filter((n) => !n.is_published);

    // Category filter
    if (activeCategory !== 'all') items = items.filter((n) => n.category === activeCategory);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.body ?? '').toLowerCase().includes(q),
      );
    }

    // Sort
    items.sort((a, b) => {
      switch (sortKey) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'event_date':
          return new Date(b.event_date ?? b.created_at).getTime() - new Date(a.event_date ?? a.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title, 'ru');
        case 'title_desc':
          return b.title.localeCompare(a.title, 'ru');
        default:
          return 0;
      }
    });

    return items;
  }, [list, activeTab, activeCategory, search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange      = (tab: Tab)    => { setActiveTab(tab); setPage(1); };
  const handleCategoryChange = (cat: string) => { setActiveCategory(cat); setPage(1); };
  const handleSortChange     = (s: SortKey)  => { setSortKey(s); setSortOpen(false); setPage(1); };
  const handleSearch         = (v: string)   => { setSearch(v); setPage(1); };

  const openCreate = () => { setEditItem(null); setPreviewItem(null); setShowForm(true); };
  const openEdit   = (item: NewsOut) => { setEditItem(item); setPreviewItem(null); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditItem(null); };

  const openPreview = (item: NewsOut) => {
    // If clicking the already-previewed item — close it
    setPreviewItem((prev) => (prev?.id === item.id ? null : item));
    setShowForm(false);
  };

  const handleSubmit = async (payload: NewsCreate, coverFile?: File | null) => {
    try {
      let newsId: string;
      if (editItem) {
        await updateNews.mutateAsync(payload);
        newsId = editItem.id;
      } else {
        const created = await createNews.mutateAsync(payload);
        newsId = created.id;
      }
      if (coverFile && newsId) {
        const formData = new FormData();
        formData.append('file', coverFile);
        await apiClient.post(`/api/v1/news/${newsId}/cover`, formData, {
          headers: { 'Content-Type': undefined },
        });
        qc.invalidateQueries({ queryKey: queryKeys.news() });
      }
    } catch (err: unknown) {
      const isApiError = err != null && typeof err === 'object' && 'status' in err && 'message' in err;
      if (!isApiError) console.error('[NewsPage] Unexpected error:', err);
    } finally {
      closeForm();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить новость?')) {
      deleteNews.mutate(id);
      if (previewItem?.id === id) setPreviewItem(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
          Новости
        </h1>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={15} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
          }} />
          <input
            placeholder="Искать..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: '0.875rem', color: '#1e293b',
              background: '#fff', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: '#0f172a', color: '#fff',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Plus size={15} />
            Новость
          </button>
        </div>
      </div>

      {/* ── Inline form panel ── */}
      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e8ecf0',
          borderRadius: 14, padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {editItem ? 'Редактировать новость' : 'Создать новость'}
            </span>
            <button
              onClick={closeForm}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', borderRadius: 6, padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>
          <NewsForm onSubmit={handleSubmit} initial={editItem ?? undefined} />
        </div>
      )}

      {/* ── Category chips + Sort ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', rowGap: 8 }}>
        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 13px', borderRadius: 9999,
                  border: active ? 'none' : '1px solid #e2e8f0',
                  background: active ? '#0f172a' : '#fff',
                  color: active ? '#fff' : '#475569',
                  fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 120ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {filtered.length} новостей
          </span>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: '0.8rem', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {SORT_OPTIONS.find((s) => s.value === sortKey)?.label ?? 'Сортировка'}
            <ChevronDown size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
          </button>
          {sortOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
              zIndex: 50, minWidth: 190, overflow: 'hidden',
            }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '9px 14px', border: 'none',
                    background: sortKey === opt.value ? '#f0f7ff' : '#fff',
                    color: sortKey === opt.value ? '#2563eb' : '#334155',
                    fontSize: '0.82rem', fontWeight: sortKey === opt.value ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>{/* end sort+count wrapper */}
      </div>

      {/* ── Table + Preview panel ── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Table card */}
        <div style={{
          flex: 1, minWidth: 0,
          background: '#fff', borderRadius: 14,
          border: '1px solid #e8ecf0', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8ecf0' }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    padding: '12px 20px', border: 'none',
                    borderBottom: active ? '2px solid #0f172a' : '2px solid transparent',
                    background: 'transparent',
                    color: active ? '#0f172a' : '#64748b',
                    fontWeight: active ? 700 : 400, fontSize: '0.875rem',
                    cursor: 'pointer', marginBottom: -1, transition: 'color 150ms',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Информация</th>
                <th style={{ ...thStyle, width: 140 }}>Дата</th>
                <th style={{ ...thStyle, width: 150 }}>Статус</th>
                <th style={{ ...thStyle, width: 90 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '56px 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📰</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>Нет новостей</div>
                  </td>
                </tr>
              ) : (
                paginated.map((news) => {
                  const isSelected = previewItem?.id === news.id;
                  return (
                    <tr
                      key={news.id}
                      onClick={() => openPreview(news)}
                      style={{
                        transition: 'background 100ms',
                        background: isSelected ? '#f0f7ff' : '',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? '#f0f7ff' : '';
                      }}
                    >
                      {/* ИНФОРМАЦИЯ */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 60, height: 44, borderRadius: 8,
                            overflow: 'hidden', background: '#f1f5f9',
                            position: 'relative', flexShrink: 0,
                            border: '1px solid #e8ecf0',
                          }}>
                            {news.cover_url ? (
                              <Image src={news.cover_url} alt={news.title} fill unoptimized style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>
                                📰
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontWeight: 600, fontSize: '0.875rem', color: '#0f172a',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: previewItem ? 220 : 380,
                            }}>
                              {news.title}
                            </div>
                            {news.body && (
                              <div style={{
                                fontSize: '0.77rem', color: '#94a3b8', marginTop: 3,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                maxWidth: previewItem ? 220 : 380,
                              }}>
                                {news.body.slice(0, 90)}{news.body.length > 90 ? '…' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ДАТА */}
                      <td style={{ ...tdStyle, color: '#475569', fontSize: '0.82rem' }}>
                        {format(
                          new Date(news.event_date ?? news.created_at),
                          'MMMM dd, yyyy', { locale: ru },
                        ).replace(/^./, (c) => c.toUpperCase())}
                      </td>

                      {/* СТАТУС */}
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <StatusToggle
                          isPublished={news.is_published}
                          isPending={togglePublished.isPending}
                          onToggle={() => togglePublished.mutate({ id: news.id, is_published: !news.is_published })}
                        />
                      </td>

                      {/* ДЕЙСТВИЯ */}
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <button
                            title="Превью"
                            onClick={() => openPreview(news)}
                            style={{
                              padding: 7, border: 'none', background: 'transparent',
                              cursor: 'pointer', borderRadius: 7,
                              color: isSelected ? '#2563eb' : '#94a3b8',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = isSelected ? '#2563eb' : '#94a3b8')}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            title="Редактировать"
                            onClick={() => openEdit(news)}
                            style={{
                              padding: 7, border: 'none', background: 'transparent',
                              cursor: 'pointer', color: '#94a3b8', borderRadius: 7,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            title="Удалить"
                            onClick={() => handleDelete(news.id)}
                            style={{
                              padding: 7, border: 'none', background: 'transparent',
                              cursor: 'pointer', color: '#94a3b8', borderRadius: 7,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 4, padding: '14px 16px', borderTop: '1px solid #f1f5f9',
            }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      background: p === page ? '#0f172a' : '#f1f5f9',
                      color:      p === page ? '#fff'     : '#475569',
                      cursor: 'pointer', fontWeight: p === page ? 700 : 400, fontSize: '0.82rem',
                    }}
                  >
                    {p}
                  </button>
                ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Preview side panel */}
        {previewItem && (
          <NewsPreviewPanel
            news={previewItem}
            onClose={() => setPreviewItem(null)}
            onEdit={() => openEdit(previewItem)}
            onCalendar={() => setCalendarId(previewItem.id)}
          />
        )}
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
