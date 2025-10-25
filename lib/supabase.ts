// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

/* === Step 1: Read environment variables === */
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* === Step 2: Safety checks & helpful console messages === */
if (!rawUrl) {
  console.error(
    "[Supabase] ❌ Missing NEXT_PUBLIC_SUPABASE_URL. " +
    "Go to Vercel → Project Settings → Environment Variables and redeploy."
  );
}

if (!anon) {
  console.error(
    "[Supabase] ❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Go to Supabase → Settings → API → copy anon public key and add to Vercel."
  );
}

/* === Step 3: Clean the URL (remove accidental trailing slash) === */
const url = (rawUrl || "").replace(/\/$/, "");

/* === Step 4: Create the client === */
export const supabase = createClient(
  url || "https://invalid.local", // fallback for build
  anon || "anon-missing"
);

/* === Step 5: Optional - quick health check === */
export async function checkSupabaseHealth() {
  try {
    const r = await fetch(`${url}/auth/v1/health`, { cache: "no-store" });
    console.log("[Supabase] Health status:", r.status); // Expect 200
    return r.ok;
  } catch (e) {
    console.error("[Supabase] Health fetch failed:", e);
    return false;
  }
}
