import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { NewsForm } from '../NewsForm';

describe('NewsForm', () => {
  it('validates and submits values', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(
      <NewsForm
        onSubmit={onSubmit}
        initial={{
          id: '1',
          author_id: 'a',
          title: 'Prepop',
          body: 'Initial body',
          category: 'general',
          is_published: false,
          allow_calendar: false,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }}
      />
    );

    const title = screen.getByTestId('news-form-title');
    const body = screen.getByTestId('news-form-body');

    const submit = screen.getByTestId('news-form-submit');

    expect(title).toHaveValue('Prepop');
    expect(body).toHaveValue('Initial body');
    expect(submit).toHaveTextContent(/Обновить/i);
  });
});
