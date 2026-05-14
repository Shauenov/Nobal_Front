'use client';

import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewsCreate, NewsOut } from '@/types/api';

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  cover_url: z.string().url('Invalid URL').optional().nullable(),
  category: z.enum([
    'olympiad',
    'hackathon',
    'deadline',
    'summer_camp',
    'webinar',
    'internship',
    'university_news',
    'general',
  ] as const),
  event_date: z.string().optional().nullable(),
  external_url: z.string().url('Invalid URL').optional().nullable(),
  is_published: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const buttonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: '6px',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  cursor: 'pointer',
};

interface NewsFormProps {
  initial?: NewsOut;
  onSubmit: (data: NewsCreate) => Promise<void>;
  isLoading?: boolean;
}

export function NewsForm({ initial, onSubmit, isLoading = false }: NewsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    mode: 'onChange',
    defaultValues: initial || { title: '', body: '', category: 'general', is_published: false },
  });

  const handleFormSubmit = async (data: NewsFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={formStyle}>
      <div>
        <label htmlFor="title" style={labelStyle}>Название</label>
        <input id="title" {...register('title')} defaultValue={initial?.title ?? ''} style={inputStyle} placeholder="Введите название новости" data-testid="news-form-title" />
        {errors.title && <div style={{ color: 'var(--color-error, #ef4444)', fontSize: 'var(--text-xs)' }}>{errors.title.message}</div>}
      </div>

      <div>
        <label htmlFor="body" style={labelStyle}>Описание</label>
        <textarea id="body" {...register('body')} rows={6} defaultValue={initial?.body ?? ''} style={{ ...inputStyle, minHeight: 160, fontFamily: 'inherit' }} placeholder="Введите текст новости" data-testid="news-form-body" />
        {errors.body && <div style={{ color: 'var(--color-error, #ef4444)', fontSize: 'var(--text-xs)' }}>{errors.body.message}</div>}
      </div>

      <div>
        <label htmlFor="category" style={labelStyle}>Категория</label>
        <select id="category" {...register('category')} defaultValue={initial?.category ?? 'general'} style={inputStyle}>
          <option value="general">Общее</option>
          <option value="olympiad">Олимпиада</option>
          <option value="hackathon">Хакатон</option>
          <option value="deadline">Дедлайн</option>
          <option value="summer_camp">Летний лагерь</option>
          <option value="webinar">Вебинар</option>
          <option value="internship">Стажировка</option>
          <option value="university_news">Новости университета</option>
        </select>
      </div>

      <div>
        <label htmlFor="event_date" style={labelStyle}>Дата события</label>
        <input id="event_date" {...register('event_date')} type="datetime-local" defaultValue={initial?.event_date ?? undefined} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="cover_url" style={labelStyle}>URL обложки</label>
        <input id="cover_url" {...register('cover_url')} type="url" defaultValue={initial?.cover_url ?? undefined} style={inputStyle} placeholder="https://..." />
      </div>

      <div>
        <label htmlFor="external_url" style={labelStyle}>Внешняя ссылка</label>
        <input id="external_url" {...register('external_url')} type="url" defaultValue={initial?.external_url ?? undefined} style={inputStyle} placeholder="https://..." />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button type="submit" style={buttonStyle} disabled={isLoading} data-testid="news-form-submit">
          {isLoading ? 'Сохранение...' : initial ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
