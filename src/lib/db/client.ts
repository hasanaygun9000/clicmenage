import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 *  SUPABASE CLIENT — SERVER-ONLY (Phase 2 backend foundation)
 * ============================================================================
 * This module is the ONLY place in the app that talks to Supabase directly.
 * Every repository under src/lib/db/repositories/ goes through
 * `getSupabaseAdminClient()` instead of importing '@supabase/supabase-js'
 * itself, so there is exactly one place to audit for credential handling.
 *
 * SECURITY — this file must NEVER be imported from a 'use client' component:
 *   - It uses SUPABASE_SERVICE_ROLE_KEY, which bypasses Row Level Security
 *     entirely. That key must only ever exist in server-side code (API
 *     routes, this repository layer) — never in a browser bundle.
 *   - The guard below throws immediately if this module is somehow
 *     evaluated in a browser context, as a defense-in-depth backstop on
 *     top of just never importing it from client code.
 *   - See src/lib/db/__tests__/security.test.ts, which scans every
 *     'use client' component for accidental references to this file or to
 *     SUPABASE_SERVICE_ROLE_KEY.
 *
 * DEMO MODE: when NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
 * not set (the default — see .env.example), `isSupabaseConfigured()` is
 * false and every repository function transparently falls back to the
 * in-memory demo store (src/lib/db/demo-store.ts) instead of calling
 * anything in this file. The site keeps working end-to-end with zero
 * Supabase credentials, exactly like Stripe/email already do.
 * ============================================================================
 */
if (typeof window !== 'undefined') {
  throw new Error(
    'src/lib/db/client.ts was imported in the browser. This module holds the Supabase service-role key and must only run server-side.'
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client authenticated with the service-role
 * key (full read/write, bypasses RLS). Throws if Supabase isn't configured
 * — callers must check `isSupabaseConfigured()` first and use the demo
 * store instead when it's false. Never call this from client-side code.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'getSupabaseAdminClient() called without NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY configured. ' +
        'Check isSupabaseConfigured() before calling this.'
    );
  }
  if (!cachedClient) {
    cachedClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}
