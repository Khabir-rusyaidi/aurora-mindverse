"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace("/login");
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
    router.replace("/login");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#8ED0F6" }} // page light blue EXACT
    >
      {/* HEADER BAR */}
      <header
        className="w-full"
        style={{ backgroundColor: "#45B4F4" }} // darker blue bar EXACT
      >
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
          <div className="leading-tight select-none">
            <h1 className="text-[28px] sm:text-[30px] font-extrabold tracking-wide text-black">
              AURORA MIND VERSE
            </h1>
            <p className="text-[14px] font-extrabold text-black/90 -mt-1">
              STEP INTO THE NEW ERA
            </p>
          </div>

          {/* PROFILE + DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              // force size so it never shrinks to tiny box
              className="inline-flex items-center gap-2 rounded-xl shadow-sm"
              style={{
                backgroundColor: "white",
                padding: "8px 14px",
                minHeight: 36,
                minWidth: 120,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "black",
                  borderRadius: "9999px",
                  display: "inline-block",
                }}
              />
              <span className="text-[13px] font-extrabold tracking-wide text-black">
                {displayName}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2">
                <button
                  onClick={logout}
                  className="w-[120px] rounded-xl font-extrabold"
                  style={{
                    backgroundColor: "white",
                    color: "#ff4040",
                    padding: "8px 0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                >
                  LOG OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BACK ARROW ROW */}
      <div className="mx-auto max-w-[1280px] px-6">
        <button
          aria-label="Back"
          onClick={() => router.back()}
          className="mt-4 rounded-lg transition"
          style={{ padding: 8 }}
          title="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* BIG ROUNDED PANEL */}
      <main className="mx-auto max-w-[1280px] px-6">
        <section
          className="mt-2 rounded-[28px] shadow-sm px-8 py-12"
          style={{ backgroundColor: "#45B4F4" }} // same as header, like your mock
        >
          <h2 className="text-center text-[24px] sm:text-[26px] font-extrabold tracking-wide text-black">
            ABOUT US
          </h2>

          {/* leave empty to match your image height */}
          <div style={{ height: 340 }} />
        </section>

        <div style={{ height: 100 }} />
      </main>
    </div>
  );
}

