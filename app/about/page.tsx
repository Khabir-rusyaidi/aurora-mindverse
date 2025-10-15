"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  // Get logged-in user; if none, go to /login
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
        const name = (metaName || emailLocal || "User").toUpperCase();
        setUser({ email: u.email ?? null, name });
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
      style={{ backgroundColor: "#8ED0F6" }} // page light blue
    >
      {/* ===== Top Header (centered title, profile fixed to right) ===== */}
      <header
        className="relative w-full"
        style={{ backgroundColor: "#45B4F4" }} // header blue
      >
        {/* Centered title block */}
        <div className="mx-auto max-w-[1400px]">
          <div className="py-4 text-center select-none">
            <h1 className="text-[28px] md:text-[30px] font-extrabold tracking-wide text-black">
              AURORA MIND VERSE
            </h1>
            <p className="text-[14px] font-extrabold text-black/90 -mt-1">
              STEP INTO THE NEW ERA
            </p>
          </div>
        </div>

        {/* Profile + Logout stacked on the RIGHT (always visible) */}
        <div className="absolute right-4 top-2 flex flex-col items-end gap-2">
          <div
            className="flex items-center gap-2 rounded-xl shadow-sm"
            style={{ backgroundColor: "white", padding: "8px 14px", minHeight: 36, minWidth: 140 }}
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
          </div>

          <button
            onClick={logout}
            className="rounded-xl font-extrabold"
            style={{
              backgroundColor: "white",
              color: "#ff4040",
              padding: "8px 18px",
              minWidth: 140,
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* ===== Back Arrow row (under header, left side) ===== */}
      <div className="mx-auto max-w-[1400px]">
        <div className="pl-[32px] pt-[16px]">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="p-2 rounded-lg hover:bg-black/5 active:scale-95 transition"
            title="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="h-6 w-6">
              <path
                fillRule="evenodd"
                d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== Big rounded panel (exact spacing + shape) ===== */}
      <main className="mx-auto max-w-[1400px]">
        {/* match the left/right in your image with big side padding */}
        <section
          className="mt-2 rounded-[28px] shadow-sm"
          style={{
            backgroundColor: "#45B4F4", // same as header
            marginLeft: "140px",
            marginRight: "140px",
            paddingTop: "28px",
            paddingBottom: "28px",
          }}
        >
          <h2 className="text-center text-[22px] md:text-[24px] font-extrabold tracking-wide text-black">
            ABOUT US
          </h2>
          {/* keep empty space inside the card to match screenshot height */}
          <div style={{ height: 300 }} />
        </section>

        {/* bottom breathing room */}
        <div style={{ height: 120 }} />
      </main>
    </div>
  );
}
