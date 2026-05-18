'use client';

import type { CSSProperties } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBroadcast, useBroadcastImage } from '@/hooks/useMessages';
import { useState } from 'react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const broadcastSchema = z.object({
  body: z.string().max(2000, 'Message must not exceed 2000 characters').optional().nullable(),
  filter_group: z.string().optional().nullable(),
  ielts_passed: z.boolean().optional().nullable(),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  width: '100%',
  maxWidth: '500px',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-error)',
  marginTop: '4px',
};

const buttonStyle = (variant: 'primary' | 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '10px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
  background: variant === 'primary' ? (disabled ? 'var(--color-border)' : 'var(--color-primary)') : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

const checkboxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

export function BroadcastModal({ isOpen, onClose }: BroadcastModalProps) {
  const broadcast = useBroadcast();
  const broadcastImage = useBroadcastImage();
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    mode: 'onChange',
    defaultValues: {
      body: '',
      filter_group: '',
      ielts_passed: undefined,
    },
  });

  const bodyValue = useWatch({ control, name: 'body' });
  const isSubmittable = !!(bodyValue?.trim()) || !!file;
  const isPending = broadcast.isPending || broadcastImage.isPending;

  if (!isOpen) return null;

  const onSubmit = async (data: BroadcastFormData) => {
    try {
      const body = data.body?.trim() || undefined;
      if (!body && !file) {
        // require either body or image
        // simple client-side error
        alert('Please provide a message body or attach an image.');
        return;
      }

      if (file) {
        await broadcastImage.mutateAsync({ image: file, body, filter_group: data.filter_group || undefined, ielts_passed: data.ielts_passed });
      } else {
        await broadcast.mutateAsync({ body, filter_group: data.filter_group || undefined, ielts_passed: data.ielts_passed });
      }
      reset();
      setFile(null);
      onClose();
    } catch (error) {
      // Error already handled by hooks
      console.error(error);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
          Send Broadcast
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Message Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
              Message Body <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              {...register('body')}
              style={{
                ...inputStyle,
                minHeight: '100px',
                resize: 'vertical',
                borderColor: errors.body ? 'var(--color-error)' : 'var(--color-border)',
              }}
              maxLength={2000}
              placeholder="Write your broadcast message here..."
            />
            {errors.body && <div style={errorStyle}>{errors.body.message}</div>}
          </div>

          {/* Image attachment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Attach Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            {file && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</div>}
          </div>

          {/* Filter by Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
              Filter by Group (Optional)
            </label>
            <input
              {...register('filter_group')}
              style={inputStyle}
              type="text"
              placeholder="e.g. D, F"
            />
          </div>

          {/* IELTS Passed Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
              Filter Options
            </label>
            <div style={checkboxStyle}>
              <input
                type="checkbox"
                id="ielts_passed"
                {...register('ielts_passed')}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <label htmlFor="ielts_passed" style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', margin: 0 }}>
                Only send to students who passed IELTS
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              style={buttonStyle('ghost')}
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={buttonStyle('primary', !isSubmittable || isPending)}
              disabled={!isSubmittable || isPending}
            >
              {isPending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
