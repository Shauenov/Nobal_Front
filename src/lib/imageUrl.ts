export function normalizeImageUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  // If URL already absolute, try to rewrite internal minio host to public endpoint
  const looksAbsolute = /^https?:\/\//i.test(raw) || raw.startsWith('//');

  const publicEndpointEnv = process.env.NEXT_PUBLIC_MINIO_PUBLIC_ENDPOINT;
  const defaultPublic = 'localhost:9000';
  const publicHost = publicEndpointEnv || defaultPublic;
  const publicWithProto = publicHost.includes('://') ? publicHost : `http://${publicHost}`;

  if (looksAbsolute) {
    try {
      const maybe = raw.startsWith('//') ? `${window.location.protocol}${raw}` : raw;
      const u = new URL(maybe);
      if (u.hostname.includes('minio')) {
        // Replace host with public endpoint while preserving path
        return `${publicWithProto.replace(/\/$/, '')}${u.pathname}${u.search}${u.hash}`;
      }
      return maybe;
    } catch {
      return raw;
    }
  }

  // Not absolute: treat as path under public host
  return `${publicWithProto.replace(/\/$/, '')}/${raw.replace(/^\/+/, '')}`;
}
