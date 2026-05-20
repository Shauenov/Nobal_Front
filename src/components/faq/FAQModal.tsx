'use client';

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFAQ, useUpdateFAQ } from '@/hooks/useFAQ';
import type { FAQOut } from '@/types/api';

const faqSchema = z.object({
  question: z.string().min(5, 'Enter a question'),
  answer: z.string().min(10, 'Enter a detailed answer'),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FAQFormValues = z.infer<typeof faqSchema>;
type FAQFormInput = Omit<FAQFormValues, 'is_active'> & { is_active?: boolean };

interface FAQModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: FAQOut | null;
  defaultOrderIndex?: number;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 15, 26, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 120,
  padding: 'var(--space-4)',
};

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 720,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-lg)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-secondary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '10px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

const previewCardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  background: 'var(--color-surface-hover)',
};

const badgeStyle: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-secondary)',
};

export function FAQModal({ open, onClose, initialValues, defaultOrderIndex }: FAQModalProps) {
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FAQFormInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      reset({
        question: initialValues.question ?? '',
        answer: initialValues.answer ?? '',
        category: initialValues.category ?? '',
        is_active: initialValues.is_active ?? true,
      });
    } else {
      reset({
        question: '',
        answer: '',
        category: '',
        is_active: true,
      });
    }
  }, [open, initialValues, reset]);

  const values = useWatch({ control }) ?? {
    question: '',
    answer: '',
    category: '',
    is_active: true,
  };

  if (!open) return null;
  const isEditing = Boolean(initialValues);
  const isPending = createFAQ.isPending || updateFAQ.isPending;

  const onSubmit = handleSubmit(async (formValues) => {
    const category = formValues.category?.trim();
    if (isEditing && initialValues) {
      await updateFAQ.mutateAsync({
        id: initialValues.id,
        data: {
          question: formValues.question,
          answer: formValues.answer,
          category: category ? category : null,
          is_active: formValues.is_active,
        },
      });
      onClose();
      return;
    }

    await createFAQ.mutateAsync({
      question: formValues.question,
      answer: formValues.answer,
      category: category ? category : null,
      is_active: formValues.is_active,
      order_index: defaultOrderIndex ?? null,
    });
    onClose();
  });

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
            {isEditing ? 'Редактировать FAQ' : 'Создать FAQ'}
          </h2>
          <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)' }}>
            {isEditing ? 'Обновите содержимое и статус FAQ.' : 'Добавьте новый вопрос в список.'}
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="faq-question">
                Вопрос
              </label>
              <input id="faq-question" style={inputStyle} {...register('question')} />
              {errors.question && <span style={errorStyle}>{errors.question.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="faq-category">
                Категория
              </label>
              <input id="faq-category" style={inputStyle} {...register('category')} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="faq-active">
                Активен
              </label>
              <input id="faq-active" type="checkbox" style={{ marginTop: 8 }} {...register('is_active')} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="faq-answer">
              Ответ
            </label>
            <textarea id="faq-answer" rows={6} style={inputStyle} {...register('answer')} />
            {errors.answer && <span style={errorStyle}>{errors.answer.message}</span>}
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <span style={labelStyle}>Предпросмотр</span>
            <div style={previewCardStyle}>
              <div style={{ fontWeight: 'var(--font-semibold)' }}>
                {values.question?.trim() || 'Предпросмотр вопроса'}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                {values.answer?.trim() || 'Здесь появится предпросмотр ответа.'}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                {values.category?.trim() && <span style={badgeStyle}>{values.category}</span>}
                <span style={badgeStyle}>{values.is_active ? 'Активен' : 'Скрыт'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 'var(--font-semibold)',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
