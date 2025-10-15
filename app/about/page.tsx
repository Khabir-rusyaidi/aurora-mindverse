"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Get current session/user (redirect to /login if not signed in)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace("/login"); // change if your login route is different
        return;
      }
      const u = session.user;
      const metaName =
        (u.user_metadata?.full_name as string | undefined) ||
        (u.user_metadata?.name as string | undefined) ||
        null;
      const emailLocal = u.email ? u.email.split("@")[0] : null;
      if (mounted) {
        setUser({
          email: u.email ?? null,
          name: (metaName || emailLocal || "User").toUpperCase(),
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const displayName = useMemo(() => user?.name ?? "USER", [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // change if needed
  };

  return (
    <div className="min-h-screen w-full bg-[#8ED0F6]"> {/* light blue like mock */}
      {/* Header */}
      <header className="w-full bg-[#45B4F4]">
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
          {/* Title block (left) */}
          <div className="leading-tight select-none">
            <h1 className="text-[28px] sm:text-[30px] font-extrabold tracking-wide text-black">
              AURORA MIND VERSE
            </h1>
            <p className="text-[14px] font-extrabold text-black/90 -mt-1">
              STEP INTO THE NEW ERA
            </p>
          </div>

          {/* Profile (right) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-xl shadow-sm hover:bg-white transition"
            >
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-black text-white text-[10px]">
                ●
              </span>
              <span className="text-[13px] font-extrabold tracking-wide text-black">
                {displayName}
              </span>
            </button>

            {/* LOG OUT pill (exactly like your image) */}
            {menuOpen && (
              <div className="absolute right-0 mt-2">
                <button
                  onClick={logout}
                  className="w-[120px] bg-white text-[#ff4040] font-extrabold text-[12px] py-2 rounded-xl shadow-sm hover:opacity-90"
                >
                  LOG OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Back arrow row (below header, far left) */}
      <div className="mx-auto max-w-[1280px] px-6">
        <button
          aria-label="Back"
          onClick={() => router.back()} // change to router.push("/teacher") if you prefer fixed page
          className="mt-4 p-2 rounded-lg hover:bg-black/5 active:scale-95 transition"
          title="Back"
        >
          {/* solid black left arrow like mock */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-black"
          >
            <path
              fillRule="evenodd"
              d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Main big rounded panel */}
      <main className="mx-auto max-w-[1280px] px-6">
        <section className="mt-2 bg-[#45B4F4] rounded-[28px] shadow-sm px-8 py-12">
          <h2 className="text-center text-[24px] sm:text-[26px] font-extrabold tracking-wide text-black">
            ABOUT US
          </h2>

          {/* keep empty to match your screenshot; add content later if you want */}
          <div className="h-[340px]" />
        </section>

        {/* bottom spacing like the mock */}
        <div className="h-28" />
      </main>
    </div>
  );
}
