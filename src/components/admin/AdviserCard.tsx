'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, BookOpen, MessageSquare } from 'lucide-react';
import type { AdminAdviserOut } from '@/types/admin';
import { cardStyle, ADMIN_ACCENT } from './adminTheme';
import { StatusPill } from './StatusPill';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

export function AdviserCard({ adviser, index = 0 }: { adviser: AdminAdviserOut; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
    >
      <Link href={`/admin/advisers/${adviser.user_id}`} style={{ textDecoration: 'none' }}>
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {adviser.avatar_url ? (
              <img
                src={adviser.avatar_url}
                alt={adviser.full_name}
                style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  background: `color-mix(in srgb, ${ADMIN_ACCENT} 14%, transparent)`,
                  color: ADMIN_ACCENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(adviser.full_name)}
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adviser.full_name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adviser.headline ?? adviser.email}
              </div>
            </div>
            <StatusPill active={adviser.is_active} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{adviser.rating_avg.toFixed(1)}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>· {adviser.reviews_count} отзывов</span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <Metric icon={<BookOpen size={15} />} label="размещено" value={adviser.students_placed ?? 0} />
            <Metric icon={<MessageSquare size={15} />} label="отзывов" value={adviser.reviews_count} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
      {icon}
      <span style={{ fontSize: 'var(--text-sm)' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>{value}</strong> {label}
      </span>
    </div>
  );
}

export default AdviserCard;
