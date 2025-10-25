"use client";

import React, { useEffect, useState } from "react";
import "./globals.css"; // make sure this path matches your file name
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, checkSupabaseHealth } from "@/lib/supabase";

type Role = "teacher" | "student";
type UserMeta = { role?: Role; name?: string };

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- Diagnostics on first render: check env & Supabase health ---
  useEffect(() => {
    // These values get replaced at build time by Next.js
    // If they log as undefined, your Vercel envs weren't included in the build → redeploy.
    // eslint-disable-next-line no-console
    console.log("[AMV] NEXT_PUBLIC_SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
    // eslint-disable-next-line no-console
    console.log(
      "[AMV] NEXT_PUBLIC_SUPABASE_ANON_KEY =",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "MISSING"
    );

    // Quick connectivity test (expects 200)
    checkSupabaseHealth().then((ok) => {
      // eslint-disable-next-line no-console
      console.log("[AMV] Supabase health:", ok ? "OK (200)" : "FAILED");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value.trim();
    const password = (form.querySelector('input[type="password"]') as HTMLInputElement)?.value;

    if (!email || !password) {
      alert("Please fill in email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1) Sign in
      const { data: signInRes, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        // Show the exact error from Supabase (CORS, bad key, invalid creds, etc.)
        console.error("[AMV] Login error:", signInErr);
        alert(signInErr.message || "Login failed.");
        return;
      }

      // 2) Fetch fresh user to read user_metadata.role
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        console.error("[AMV] getUser error:", userErr);
        alert("Could not load your account. Please try again.");
        return;
      }

      const meta = (userRes.user.user_metadata || {}) as UserMeta;
      const role: Role = (meta.role as Role) || "student"; // default role

      // 3) Optional: cookie for simple client-side guards
      document.cookie = `amv-role=${role}; Path=/; Max-Age=86400; SameSite=Lax`;

      // 4) Clean form and redirect by role
      form.reset();
      router.replace(role === "teacher" ? "/teacher" : "/student");
    } catch (e: any) {
      // If you ever hit "Failed to fetch", this will log the real browser error object
      console.error("[AMV] Unexpected login exception:", e);
      alert(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <div className="welcome-section">
        <h2 className="welcome-title">Welcome To Our Application</h2>
        <hr className="divider" />
        <p className="welcome-text">
          Through this website platform, students will not only read or watch learning materials passively
          but they will also be able to walk inside a virtual world like a video game to explore the topics provided.
        </p>
      </div>

      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter email" required />
          <input type="password" placeholder="Enter password" required />

          {/* Visual only; actual role comes from Supabase user_metadata.role */}
          <select>
            <option value="">Role (optional)</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <div className="links">
            <Link href="/register">Register now</Link>
            <Link href="/forgot-password" className="forgot">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ---- Optional tiny debug UI you can remove later ---- */}
        <details style={{ marginTop: 12 }}>
          <summary>Debug</summary>
          <div style={{ fontSize: 12, marginTop: 8 }}>
            <p>
              URL: <code>{String(process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined")}</code>
            </p>
            <button
              type="button"
              onClick={async () => {
                const ok = await checkSupabaseHealth();
                alert(`Supabase health: ${ok ? "OK (200)" : "FAILED"}`);
              }}
            >
              Test Supabase Health
            </button>
          </div>
        </details>
        {/* ----------------------------------------------------- */}
      </div>
    </div>
  );
}
