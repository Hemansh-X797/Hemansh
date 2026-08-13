import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * The service role key bypasses Row Level Security entirely. It must never
 * reach the browser. The `server-only` import above makes Next.js throw a
 * build error if any client component ever imports this file, as a
 * hard guardrail on top of just "remembering" not to.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — see SETUP.md');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
