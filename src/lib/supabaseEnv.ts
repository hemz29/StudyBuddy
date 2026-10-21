// Supabase settings, shared by the server code and the middleware.
// Older Supabase projects call the keys "anon" and "service_role"; newer ones (and Vercel's integration) use
// "publishable" and "secret". Either works.
const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

// The client adds /auth/v1, /rest/v1 itself, so a pasted ".../rest/v1/" address would give
// "Invalid path specified in request URL". Keep only https://<project>.supabase.co.
function origin(raw: string | undefined) {
  if (!raw?.trim()) return undefined;
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return raw.trim();
  }
}

export const SUPABASE_URL = origin(RAW_URL);
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
