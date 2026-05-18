'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  label?: string;
  accept?: string;
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  isUploading = false,
  label = 'Upload Image',
  accept = 'image/jpeg, image/png, image/webp',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      await onUpload(file);
    } catch {
      // Revert preview on error
      setPreview(null);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = preview || currentImageUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {label}
      </label>
      
      <div
        onClick={handleContainerClick}
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          background: 'var(--color-surface-hover)',
          minHeight: '160px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--color-border)';
          if (isUploading) return;
          
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            try {
              await onUpload(file);
            } catch {
              setPreview(null);
            }
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {displayUrl ? (
          <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Upload preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: isUploading ? 0.5 : 1,
              }}
            />
          </div>
        ) : (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              <Upload size={24} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>
                Click or drag image to upload
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          </>
        )}

        {isUploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(2px)',
          }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
