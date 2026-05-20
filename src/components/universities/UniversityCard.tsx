'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UniversityOut } from '@/types/api';

interface UniversityCardProps {
  university: UniversityOut;
  onTogglePublished?: (published: boolean) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 9999,
        background: '#e8ecf0',
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          height: '100%',
          background: color,
          borderRadius: 9999,
          transition: 'width 400ms ease',
        }}
      />
    </div>
  );
}

export function UniversityCard({ university }: UniversityCardProps) {
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = [university.city, university.country].filter(Boolean).join(', ');
  const acceptancePct = university.acceptance_rate != null ? Math.round(university.acceptance_rate * 100) : null;
  const popularityPct = university.international_pct != null ? Math.round(university.international_pct * 100) : null;

  const cardStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #e8ecf0',
    boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 150ms ease',
    position: 'relative',
  };

  return (
    <div style={cardStyle}>
      {/* Cover image */}
      <div
        style={{
          height: 160,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {university.cover_image_url && !coverError && (
          <Image
            src={university.cover_image_url}
            alt={university.name}
            fill
            unoptimized
            style={{ objectFit: 'cover' }}
            onError={() => setCoverError(true)}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* University name overlay on cover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 14px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {university.logo_url && !logoError ? (
              <Image
                src={university.logo_url}
                alt={university.name}
                width={42}
                height={42}
                unoptimized
                style={{ objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span style={{ fontSize: '1.2rem' }}>🏫</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#fff',
                lineHeight: 1.2,
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {university.name}
            </div>
            {location && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                📍 {location}
              </div>
            )}
          </div>
        </div>

        {/* Rating badge */}
        {university.qs_ranking != null && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            ★ Рейтинг #{university.qs_ranking}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Acceptance rate */}
        {acceptancePct != null && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
                marginBottom: 5,
              }}
            >
              <span>Уровень поступления</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{acceptancePct}%</span>
            </div>
            <ProgressBar pct={acceptancePct} color="#2563eb" />
          </div>
        )}

        {/* Popularity / international */}
        {popularityPct != null && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
                marginBottom: 5,
              }}
            >
              <span>Популярность</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{popularityPct}%</span>
            </div>
            <ProgressBar pct={popularityPct} color="#10b981" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          padding: '10px 14px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <Link
          href={`/universities/${university.id}?tab=applications`}
          style={{
            padding: '8px 0',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#1e293b',
            fontSize: '0.78rem',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 150ms ease',
          }}
        >
          Список заявок
        </Link>
        <Link
          href={`/universities/${university.id}`}
          style={{
            padding: '8px 0',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 150ms ease',
          }}
        >
          Управлять
        </Link>
      </div>
    </div>
  );
}
