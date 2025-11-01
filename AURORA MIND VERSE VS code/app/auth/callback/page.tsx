"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Role = "student" | "teacher";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // 1) Get the freshly authenticated user
      const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
      if (getUserErr || !user) {
        // If somehow no session, send back to login
        router.replace("/");
        return;
      }

      // 2) Read role from user_metadata (default to student)
      const role: Role = (user.user_metadata?.role as Role) || "student";

      // 3) Try to upsert a profile row (optional but recommended)
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          role,
          name: (user.user_metadata?.name as string) ?? null,
        });
      } catch {
        // If profiles table not present or RLS blocks it, we still continue
      }

      // 4) Small cookie for quick middleware checks (optional)
      document.cookie = `amv-role=${role}; Path=/; Max-Age=86400; SameSite=Lax`;

      // 5) Redirect by role
      router.replace(role === "teacher" ? "/teacher" : "/student");
    })();
  }, [router]);

  // === UI unchanged (shows briefly while redirecting) ===
  return (
    <div style={{ width: "90%", maxWidth: 700, margin: "60px auto", textAlign: "center" }}>
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <div className="form-card">
        <h2 className="welcome-title" style={{ marginTop: 0 }}>Email confirmed</h2>
        <p className="welcome-text">
          Thanks! We’ve verified your email. Redirecting you now…
        </p>
        <p className="welcome-text" style={{ marginTop: 12 }}>
          If nothing happens, <Link href="/" style={{ fontWeight: 700 }}>click here</Link>.
        </p>
      </div>
    </div>
  );
}
