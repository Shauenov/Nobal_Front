import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { UniversityOut } from '@/types/api';
import { UniversityCard } from '../UniversityCard';

const mockUniversity: UniversityOut = {
  id: 'uni-1',
  name: 'Test University',
  country: 'USA',
  city: 'New York',
  qs_ranking: 45,
  acceptance_rate: 0.25,
  language_of_instr: 'English',
  is_published: true,
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UniversityCard', () => {
  it('renders university information', () => {
    render(
      <UniversityCard
        university={mockUniversity}
        programCount={3}
      />
    );

    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
    expect(screen.getByText('#45')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows published badge when is_published is true', () => {
    render(
      <UniversityCard
        university={{ ...mockUniversity, is_published: true }}
      />
    );

    expect(screen.getByText('✓ Published')).toBeInTheDocument();
  });

  it('shows draft badge when is_published is false', () => {
    render(
      <UniversityCard
        university={{ ...mockUniversity, is_published: false }}
      />
    );

    expect(screen.getByText('○ Draft')).toBeInTheDocument();
  });

  it('calls onTogglePublished when published button is clicked', async () => {
    const onTogglePublished = vi.fn();
    const user = userEvent.setup();

    render(
      <UniversityCard
        university={mockUniversity}
        onTogglePublished={onTogglePublished}
      />
    );

    const publishButton = screen.getByRole('button', { name: /Published/i });
    await user.click(publishButton);

    expect(onTogglePublished).toHaveBeenCalledWith(false);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <UniversityCard
        university={mockUniversity}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });

  it('has view button linking to detail page', () => {
    render(
      <UniversityCard university={mockUniversity} />
    );

    const viewLinks = screen.getAllByRole('link');
    // Last link is the View button
    const viewButton = viewLinks[viewLinks.length - 1];
    expect(viewButton).toHaveAttribute('href', '/universities/uni-1');
  });

  it('hides optional metrics when not provided', () => {
    render(
      <UniversityCard
        university={{
          ...mockUniversity,
          qs_ranking: null,
          acceptance_rate: null,
          language_of_instr: null,
        }}
      />
    );

    expect(screen.queryByText('#45')).not.toBeInTheDocument();
    expect(screen.queryByText('25.0%')).not.toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });
});
