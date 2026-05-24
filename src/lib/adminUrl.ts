// Admin panel lives on its own locked subdomain in production
// (admin.nobal.tech, behind nginx HTTP Basic Auth). On the public site we
// send admins there; on the subdomain itself or in local dev we stay relative.

export const ADMIN_SUBDOMAIN = 'admin.nobal.tech';

/**
 * Where an admin should land after auth / root redirect.
 * - On admin.nobal.tech or localhost → relative path (same app).
 * - On the public site (nobal.tech) → absolute URL to the locked subdomain.
 */
export function adminHome(path = '/admin'): string {
  if (typeof window === 'undefined') return path;
  const host = window.location.hostname;
  if (host === ADMIN_SUBDOMAIN || host === 'localhost' || host === '127.0.0.1') {
    return path;
  }
  return `https://${ADMIN_SUBDOMAIN}${path}`;
}

/** Navigate an admin to their home, handling cross-origin hops. */
export function goToAdminHome(routerReplace: (p: string) => void, path = '/admin'): void {
  const dest = adminHome(path);
  if (dest.startsWith('http')) {
    window.location.href = dest; // cross-host: full navigation (triggers Basic Auth prompt)
  } else {
    routerReplace(dest);
  }
}
