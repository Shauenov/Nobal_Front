'use client';

import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X, Calendar } from 'lucide-react';
import type { NewsCreate, NewsOut } from '@/types/api';

const newsSchema = z.object({
  title:          z.string().min(1, 'Обязательное поле'),
  body:           z.string().min(1, 'Обязательное поле'),
  category:       z.enum([
    'olympiad', 'hackathon', 'deadline', 'summer_camp',
    'webinar', 'internship', 'university_news', 'general',
  ] as const),
  event_date:     z.string().optional().nullable(),
  external_url:   z.string().url('Неверный URL').optional().nullable().or(z.literal('')),
  is_published:   z.boolean().optional(),
  allow_calendar: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '0.875rem',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
};

const errStyle: CSSProperties = {
  fontSize: '0.72rem',
  color: '#ef4444',
  marginTop: 4,
};

interface NewsFormProps {
  initial?: NewsOut;
  onSubmit: (data: NewsCreate, coverFile?: File | null) => Promise<void>;
  isLoading?: boolean;
}

export function NewsForm({ initial, onSubmit, isLoading = false }: NewsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_url ?? null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    mode: 'onSubmit',
    // `values` is reactive — form re-initialises whenever `initial` changes
    values: {
      title:          initial?.title          ?? '',
      body:           initial?.body           ?? '',
      category:       (initial?.category as NewsFormData['category']) ?? 'general',
      event_date:     initial?.event_date     ?? null,
      external_url:   initial?.external_url   ?? '',
      is_published:   initial?.is_published   ?? false,
      allow_calendar: initial?.allow_calendar ?? false,
    },
  });

  /* ── Image picker ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Submit ── */
  const handleFormSubmit = async (data: NewsFormData) => {
    const payload: NewsCreate = {
      ...data,
      cover_url:      initial?.cover_url ?? null,
      external_url:   data.external_url || null,
      event_date:     data.event_date   || null,
      allow_calendar: data.allow_calendar ?? false,
    };
    await onSubmit(payload, coverFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Название */}
      <div>
        <label style={labelStyle}>Название</label>
        <input
          {...register('title')}
          style={inputStyle}
          placeholder="Введите название новости"
          data-testid="news-form-title"
        />
        {errors.title && <div style={errStyle}>{errors.title.message}</div>}
      </div>

      {/* Описание */}
      <div>
        <label style={labelStyle}>Описание</label>
        <textarea
          {...register('body')}
          rows={6}
          style={{ ...inputStyle, minHeight: 140, fontFamily: 'inherit', resize: 'vertical' }}
          placeholder="Введите текст новости"
          data-testid="news-form-body"
        />
        {errors.body && <div style={errStyle}>{errors.body.message}</div>}
      </div>

      {/* Обложка (file upload) */}
      <div>
        <label style={labelStyle}>Обложка</label>

        {coverPreview ? (
          /* Preview */
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt="Обложка"
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                display: 'block',
              }}
            />
            <button
              type="button"
              onClick={removeCover}
              style={{
                position: 'absolute', top: 8, right: 8,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: 'none',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 8,
                padding: '6px 14px',
                borderRadius: 7,
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontSize: '0.78rem',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Заменить изображение
            </button>
          </div>
        ) : (
          /* Drop zone */
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #e2e8f0',
              borderRadius: 10,
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f8fafc',
              transition: 'border-color 150ms, background 150ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#94a3b8';
              (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
              (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
            }}
          >
            <ImagePlus size={28} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
              Нажмите для выбора изображения
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
              PNG, JPG, WEBP — до 5 МБ
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Категория */}
      <div>
        <label style={labelStyle}>Категория</label>
        <select
          {...register('category')}
          style={{
            ...inputStyle,
            borderColor: errors.category ? '#fca5a5' : '#e2e8f0',
          }}
        >
          <option value="general">Общее</option>
          <option value="olympiad">Олимпиада</option>
          <option value="hackathon">Хакатон</option>
          <option value="deadline">Дедлайн</option>
          <option value="summer_camp">Летний лагерь</option>
          <option value="webinar">Вебинар</option>
          <option value="internship">Стажировка</option>
          <option value="university_news">Новости университета</option>
        </select>
        {errors.category && <div style={errStyle}>{errors.category.message}</div>}
      </div>

      {/* Дата события */}
      <div>
        <label style={labelStyle}>Дата события <span style={{ color: '#94a3b8', fontWeight: 400 }}>(необязательно)</span></label>
        <input {...register('event_date')} type="date" style={inputStyle} />
      </div>

      {/* Ссылка на источник */}
      <div>
        <label style={labelStyle}>
          Ссылка на источник
          <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>
            (необязательно — сайт олимпиады, вебинара и т.д.)
          </span>
        </label>
        <input
          {...register('external_url')}
          type="url"
          style={inputStyle}
          placeholder="https://..."
        />
        {errors.external_url && <div style={errStyle}>{errors.external_url.message}</div>}
      </div>

      {/* Разрешить добавление в календарь */}
      <Controller
        name="allow_calendar"
        control={control}
        render={({ field }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${field.value ? '#bfdbfe' : '#e2e8f0'}`,
              background: field.value ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              userSelect: 'none',
            }}
            onClick={() => field.onChange(!field.value)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: field.value ? '#dbeafe' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms ease',
                flexShrink: 0,
              }}>
                <Calendar size={16} color={field.value ? '#2563eb' : '#94a3b8'} />
              </div>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: field.value ? '#1d4ed8' : '#475569' }}>
                  Можно добавить в календарь
                </div>
                <div style={{ fontSize: '0.73rem', color: field.value ? '#3b82f6' : '#94a3b8', marginTop: 1 }}>
                  {field.value
                    ? 'Студенты смогут сохранить это событие в календарь'
                    : 'Только информационная новость, без даты события'}
                </div>
              </div>
            </div>

            {/* Toggle switch */}
            <div style={{
              width: 40, height: 22, borderRadius: 99,
              background: field.value ? '#2563eb' : '#cbd5e1',
              position: 'relative', flexShrink: 0,
              transition: 'background 200ms ease',
            }}>
              <div style={{
                position: 'absolute',
                top: 3, left: field.value ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 200ms ease',
              }} />
            </div>
          </div>
        )}
      />

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={isLoading}
          data-testid="news-form-submit"
          style={{
            padding: '10px 28px',
            borderRadius: 8,
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Сохранение...' : initial ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
