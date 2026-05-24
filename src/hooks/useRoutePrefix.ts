'use client';

import { usePathname } from 'next/navigation';

/**
 * Shared feature components (UniversityCard, StudentGrid, …) are rendered in
 * BOTH the adviser route group (/students, /universities) and the admin group
 * (/admin/students, /admin/universities). Their internal nav links must stay
 * inside the current shell, otherwise an admin clicking a card would be thrown
 * into the adviser interface.
 *
 * Returns '/admin' when the current page is under the admin group, '' otherwise.
 * Use it to prefix link hrefs:  `${prefix}/universities/${id}`.
 */
export function useRoutePrefix(): string {
  const pathname = usePathname();
  return pathname?.startsWith('/admin') ? '/admin' : '';
}
