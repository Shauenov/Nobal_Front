'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UniversityOut } from '@/types/api';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';

interface UniversityCardProps {
  university: UniversityOut;
  onDelete?: () => void;
  isLoading?: boolean;
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 9999,
        background: '#e8ecf0',
        overflow: 'hidden',
        marginTop: 6,
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

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function UniversityCard({ university }: UniversityCardProps) {
  const prefix = useRoutePrefix();
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const location = [university.city, university.country].filter(Boolean).join(', ');
  const acceptancePct = university.acceptance_rate != null ? Math.round(university.acceptance_rate * 100) : null;
  const popularityPct = university.international_pct != null ? Math.round(university.international_pct * 100) : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid #e8ecf0',
        boxShadow: '0 2px 10px rgba(15,23,42,0.07)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Cover image ── */}
      <div
        style={{
          height: 190,
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

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Edit button — top right */}
        <Link
          href={`${prefix}/universities/${university.id}/edit`}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
          title="Редактировать"
          onClick={(e) => e.stopPropagation()}
        >
          <PencilIcon />
        </Link>

        {/* Bottom overlay: logo + name + address */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 14px 14px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            {university.logo_url && !logoError ? (
              <Image
                src={university.logo_url}
                alt={university.name}
                width={44}
                height={44}
                unoptimized
                style={{ objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span style={{ fontSize: '1.2rem' }}>🏫</span>
            )}
          </div>

          {/* Name + location */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#fff',
                lineHeight: 1.25,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
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
                  fontSize: '0.71rem',
                  color: 'rgba(255,255,255,0.82)',
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
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '12px 14px 4px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

        {/* Rating badge — below cover */}
        {university.qs_ranking != null && (
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 20,
                border: '1.5px solid #c7d7fe',
                background: '#eff4ff',
                color: '#3b5bdb',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '0.82rem' }}>♡</span>
              Рейтинг #{university.qs_ranking}
            </div>
          </div>
        )}

        {/* Two metrics side-by-side */}
        {(acceptancePct != null || popularityPct != null) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: acceptancePct != null && popularityPct != null ? '1fr 1fr' : '1fr',
              gap: 12,
            }}
          >
            {acceptancePct != null && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                    Успешные поступления
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginLeft: 4 }}>
                    {acceptancePct}%
                  </span>
                </div>
                <ProgressBar pct={acceptancePct} color="#2563eb" />
              </div>
            )}

            {popularityPct != null && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                    Популярность
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginLeft: 4 }}>
                    {popularityPct}%
                  </span>
                </div>
                <ProgressBar pct={popularityPct} color="#10b981" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div
        style={{
          padding: '10px 14px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {/* Список заявок — outlined */}
        <Link
          href={`${prefix}/universities/${university.id}/applications`}
          style={{
            padding: '10px 0',
            borderRadius: 10,
            border: '1.5px solid #e2e8f0',
            background: '#fff',
            color: '#334155',
            fontSize: '0.8rem',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          Список заявок
        </Link>

        {/* Управлять — dark filled */}
        <Link
          href={`${prefix}/universities/${university.id}`}
          style={{
            padding: '10px 0',
            borderRadius: 10,
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          Управлять
        </Link>
      </div>
    </div>
  );
}
