'use client';

import type { CSSProperties } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  transition: 'opacity 200ms ease',
};

const dotsWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const dotStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: '#ffffff',
};

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div style={overlayStyle} aria-label="Загрузка..." role="status">
      <div style={dotsWrapStyle}>
        <span style={{ ...dotStyle, animation: 'dotBounce 1.2s ease-in-out infinite 0ms' }} />
        <span style={{ ...dotStyle, animation: 'dotBounce 1.2s ease-in-out infinite 200ms' }} />
        <span style={{ ...dotStyle, animation: 'dotBounce 1.2s ease-in-out infinite 400ms' }} />
      </div>
    </div>
  );
}
