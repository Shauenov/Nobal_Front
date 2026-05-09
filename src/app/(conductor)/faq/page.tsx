'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import { FAQModal } from '@/components/faq/FAQModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDeleteFAQ, useFAQs, useReorderFAQs, useUpdateFAQ } from '@/hooks/useFAQ';
import type { FAQOut } from '@/types/api';

const cardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const itemStyle = (isDragging: boolean): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 'var(--space-3)',
  alignItems: 'center',
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  opacity: isDragging ? 0.6 : 1,
});

const badgeStyle: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  background: 'var(--color-surface-hover)',
  color: 'var(--color-text-secondary)',
};

const actionButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontWeight: 'var(--font-semibold)',
};

const primaryButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  border: '1px solid transparent',
  background: 'var(--color-primary)',
  color: '#fff',
};

const inlineButtonStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
};

const toggleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const dragHandleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  cursor: 'grab',
};

const sortByOrder = (items: FAQOut[]) => [...items].sort((a, b) => a.order_index - b.order_index);

interface SortableFAQItemProps {
  faq: FAQOut;
  displayOrder: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isMutating: boolean;
}

function SortableFAQItem({
  faq,
  displayOrder,
  isOpen,
  onToggleOpen,
  onEdit,
  onToggleActive,
  onDelete,
  isMutating,
}: SortableFAQItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });
  const style = {
    ...itemStyle(isDragging),
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties;

  const summary = faq.answer.length > 140 ? `${faq.answer.slice(0, 140)}...` : faq.answer;

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={onToggleOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            padding: 0,
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
          }}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{faq.question}</span>
        </button>

        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {isOpen ? faq.answer : summary}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {faq.category && <span style={badgeStyle}>{faq.category}</span>}
          <span style={badgeStyle}>Order {displayOrder}</span>
          <label style={toggleStyle}>
            <input
              type="checkbox"
              checked={faq.is_active}
              onChange={onToggleActive}
              disabled={isMutating}
            />
            {faq.is_active ? 'Active' : 'Hidden'}
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button type="button" style={inlineButtonStyle} onClick={onEdit} disabled={isMutating}>
            Edit
          </button>
          <button
            type="button"
            style={{
              ...inlineButtonStyle,
              color: 'var(--color-error)',
              borderColor: 'var(--color-error)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={onDelete}
            disabled={isMutating}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
          <button type="button" style={dragHandleStyle} {...attributes} {...listeners} aria-label="Drag FAQ">
            <GripVertical size={14} />
          </button>
          <span style={{ fontSize: 'var(--text-xs)' }}>#{displayOrder}</span>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const faqs = useFAQs();
  const reorder = useReorderFAQs();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();

  const baseItems = useMemo(() => sortByOrder(faqs.data ?? []), [faqs.data]);
  const [draftItems, setDraftItems] = useState<FAQOut[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQOut | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const visibleItems = isDirty ? draftItems : baseItems;

  const handleReset = () => {
    setDraftItems(baseItems);
    setIsDirty(false);
  };

  const handleSave = () => {
    if (!isDirty) return;
    reorder.mutate(
      {
        items: visibleItems.map((item, index) => ({
          id: item.id,
          order_index: index + 1,
        })),
      },
      {
        onSuccess: () => setIsDirty(false),
      },
    );
  };

  const handleToggleActive = (faq: FAQOut) => {
    updateFAQ.mutate(
      {
        id: faq.id,
        data: { is_active: !faq.is_active },
      },
      {
        onSuccess: (updated) => {
          setDraftItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        },
      },
    );
  };

  const handleDelete = (faq: FAQOut) => {
    if (!window.confirm('Delete this FAQ?')) return;
    deleteFAQ.mutate(faq.id, {
      onSuccess: () => {
        setDraftItems((prev) => prev.filter((item) => item.id !== faq.id));
      },
    });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <PageHeader
        title="FAQ"
        subtitle="Drag questions to reorder the FAQ list."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              style={actionButtonStyle}
              onClick={() => {
                setEditingFAQ(null);
                setModalOpen(true);
              }}
            >
              New FAQ
            </button>
            <button
              type="button"
              style={actionButtonStyle}
              onClick={handleReset}
              disabled={!isDirty || reorder.isPending}
            >
              Reset order
            </button>
            <button
              type="button"
              style={primaryButtonStyle}
              onClick={handleSave}
              disabled={!isDirty || reorder.isPending}
            >
              {reorder.isPending ? 'Saving...' : 'Save order'}
            </button>
          </div>
        }
      />

      <div style={cardStyle}>
        {faqs.isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading FAQ items...</div>
        ) : faqs.isError ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Failed to load FAQ items.</div>
        ) : visibleItems.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>No FAQ items yet.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              setDraftItems((prev) => {
                const source = isDirty ? prev : baseItems;
                const working = source.length > 0 ? source : baseItems;
                const oldIndex = working.findIndex((item) => item.id === active.id);
                const newIndex = working.findIndex((item) => item.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return prev;
                return arrayMove(working, oldIndex, newIndex);
              });
              setIsDirty(true);
            }}
          >
            <SortableContext items={visibleItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {visibleItems.map((faq, index) => (
                  <SortableFAQItem
                    key={faq.id}
                    faq={faq}
                    displayOrder={index + 1}
                    isOpen={openId === faq.id}
                    onToggleOpen={() => setOpenId((prev) => (prev === faq.id ? null : faq.id))}
                    onEdit={() => {
                      setEditingFAQ(faq);
                      setModalOpen(true);
                    }}
                    onToggleActive={() => handleToggleActive(faq)}
                    onDelete={() => handleDelete(faq)}
                    isMutating={updateFAQ.isPending || deleteFAQ.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <FAQModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingFAQ(null);
        }}
        initialValues={editingFAQ}
        defaultOrderIndex={visibleItems.length + 1}
      />
    </div>
  );
}
