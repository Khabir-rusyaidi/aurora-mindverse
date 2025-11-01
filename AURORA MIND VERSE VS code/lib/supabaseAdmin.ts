// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Create the Supabase Admin client at runtime (NOT at import time).
 * Call this ONLY inside server code (API routes, server actions).
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}
