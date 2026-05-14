'use client';

import React, { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.06), rgba(0,0,0,0.04))',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
    />
  );
}

export default Skeleton;
