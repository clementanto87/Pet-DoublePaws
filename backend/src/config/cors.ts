// Centralized CORS origin allow-list logic, shared by the Express app and Socket.io.
//
// CORS_ORIGIN may be a single origin or a comma-separated list, e.g.
//   CORS_ORIGIN=https://pet-double-paws-ufce.vercel.app,https://mydomain.com
// Trailing slashes are ignored. In addition, any *.vercel.app subdomain and
// the production doublepaws24.com domain (apex or any subdomain) are allowed
// by default, so the deployed web/frontend works without reconfiguring.

const stripSlash = (value: string): string => value.trim().replace(/\/$/, '');

const allowedOrigins: string[] = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(stripSlash)
  .filter(Boolean);

// Allow localhost dev origins by default when no explicit list is configured,
// or always (they are harmless in production and convenient in dev).
const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;
const vercelRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
// Production brand domain: apex (https://doublepaws24.com) and any subdomain
// (e.g. https://app.doublepaws24.com, https://www.doublepaws24.com).
const doublePawsRegex = /^https:\/\/([a-z0-9-]+\.)*doublepaws24\.com$/i;
// Cloudflare Workers (*.workers.dev) and Cloudflare Pages (*.pages.dev)
const cloudflareRegex = /^https:\/\/([a-z0-9-]+\.)*(workers\.dev|pages\.dev)$/i;

export const isAllowedOrigin = (origin: string): boolean => {
  const normalized = stripSlash(origin);

  // If a wildcard is explicitly configured, allow everything.
  if (allowedOrigins.includes('*')) return true;

  if (allowedOrigins.includes(normalized)) return true;
  if (vercelRegex.test(normalized)) return true;
  if (cloudflareRegex.test(normalized)) return true;
  if (doublePawsRegex.test(normalized)) return true;
  if (localhostRegex.test(normalized)) return true;

  return false;
};
