'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cardStyle } from './adminTheme';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
  loading?: boolean;
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'var(--color-primary)', trend, delay = 0, loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {sub && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{sub}</span>}
        {trend && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: trend.positive ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
