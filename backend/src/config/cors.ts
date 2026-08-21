// Centralized CORS origin allow-list logic, shared by the Express app and Socket.io.
//
// CORS_ORIGIN may be a single origin or a comma-separated list, e.g.
//   CORS_ORIGIN=https://pet-double-paws-ufce.vercel.app,https://mydomain.com
// Trailing slashes are ignored. In addition, any *.vercel.app subdomain is
// allowed so Vercel preview/branch deployments work without reconfiguring.

const stripSlash = (value: string): string => value.trim().replace(/\/$/, '');

const allowedOrigins: string[] = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(stripSlash)
  .filter(Boolean);

// Allow localhost dev origins by default when no explicit list is configured,
// or always (they are harmless in production and convenient in dev).
const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;
const vercelRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

export const isAllowedOrigin = (origin: string): boolean => {
  const normalized = stripSlash(origin);

  // If a wildcard is explicitly configured, allow everything.
  if (allowedOrigins.includes('*')) return true;

  if (allowedOrigins.includes(normalized)) return true;
  if (vercelRegex.test(normalized)) return true;
  if (localhostRegex.test(normalized)) return true;

  return false;
};
