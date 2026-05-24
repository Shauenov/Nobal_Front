'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { NewsOut } from '@/types/api';
import { format } from 'date-fns';
import { useUploadNewsCover } from '@/hooks/useNews';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';

interface NewsCardProps {
  news: NewsOut;
  onTogglePublish?: (id: string, is_published: boolean) => void;
  onAddToCalendar?: () => void;
}

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 200ms ease',
  cursor: 'pointer',
};

const imageContainerStyle: CSSProperties = {
  width: '100%',
  height: 200,
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--color-surface-hover)',
};

const emptyImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-hover) 100%)',
  fontSize: '48px',
};

const contentStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--space-4)',
  gap: 'var(--space-2)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-2)',
};

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: '600',
  color: 'var(--color-text-primary)',
  margin: 0,
  lineHeight: '1.4',
};

const categoryBadgeStyle: CSSProperties = {
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: '500',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const metaStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const bodyStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: '1.5',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 'var(--space-3)',
  borderTop: '1px solid var(--color-border)',
  marginTop: 'auto',
};

const viewsCountStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
};

const actionButtonStyle: CSSProperties = {
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 'var(--text-xs)',
  fontWeight: '500',
  color: 'var(--color-text-primary)',
  transition: 'all 150ms ease',
};

const publishedButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  background: 'var(--color-success, #10b981)',
  color: 'white',
  border: 'none',
};

export function NewsCard({ news, onTogglePublish, onAddToCalendar }: NewsCardProps) {
  const prefix = useRoutePrefix();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCover = useUploadNewsCover(news.id);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadCover.mutateAsync(file);
  };

  return (
    <div style={cardStyle}>
      {/* Image Section */}
      <div style={imageContainerStyle}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleCoverUpload}
        />
        {news.cover_url ? (
          <>
            <Image
              src={news.cover_url}
              alt={news.title}
              fill
              style={{ objectFit: 'cover', opacity: uploadCover.isPending ? 0.5 : 1 }}
            />
            {/* Replace cover button */}
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              disabled={uploadCover.isPending}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              {uploadCover.isPending ? '⏳' : '📷 Сменить'}
            </button>
          </>
        ) : (
          <div
            style={{ ...emptyImageStyle, cursor: 'pointer', flexDirection: 'column', gap: '8px' }}
            onClick={() => fileInputRef.current?.click()}
            title="Загрузить обложку"
          >
            {uploadCover.isPending ? (
              <span style={{ fontSize: '24px' }}>⏳</span>
            ) : (
              <>
                <span style={{ fontSize: '36px' }}>📰</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Загрузить обложку</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            <Link
              href={`${prefix}/news/${news.id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {news.title}
            </Link>
          </h3>
          <div style={categoryBadgeStyle}>{news.category}</div>
        </div>

        {/* Meta */}
        <div style={metaStyle}>
          {news.event_date
            ? format(new Date(news.event_date), 'PPpp')
            : format(new Date(news.created_at), 'PPpp')}
        </div>

        {/* Body Preview */}
        <p style={bodyStyle}>{news.body}</p>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={viewsCountStyle}>👁 {news.views_count} просмотров</div>
          <div style={actionsStyle}>
            {onAddToCalendar && (
              <button
                onClick={onAddToCalendar}
                style={actionButtonStyle}
                title="Добавить в календарь"
              >
                📅
              </button>
            )}
            {onTogglePublish && (
              <button
                onClick={() => onTogglePublish(news.id, !news.is_published)}
                style={
                  news.is_published ? publishedButtonStyle : actionButtonStyle
                }
                title={news.is_published ? 'Отозвать' : 'Опубликовать'}
              >
                {news.is_published ? '✓' : '○'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
