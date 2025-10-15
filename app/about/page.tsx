"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

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
        (u.user_metadata?.name as string | undefined) || null;
      const emailLocal = u.email ? u.email.split("@")[0] : null;
      if (mounted) setUser({ email: u.email ?? null, name: (metaName || emailLocal || "User").toUpperCase() });
    })();
    return () => { mounted = false; };
  }, [router]);

  const displayName = useMemo(() => user?.name ?? "USER", [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    // FIX: full-viewport layer so parent wrappers can't constrain width
    <div className="fixed inset-0 z-[50] w-screen h-screen overflow-auto" style={{ backgroundColor: "#8ED0F6" }}>
      {/* header bar */}
      <header className="w-full" style={{ backgroundColor: "#45B4F4" }}>
        <div className="py-4 text-center select-none">
          <h1 className="text-[28px] md:text-[30px] font-extrabold tracking-wide text-black">
            AURORA MIND VERSE
          </h1>
          <p className="text-[14px] font-extrabold text-black/90 -mt-1">STEP INTO THE NEW ERA</p>
        </div>

        {/* profile + logout (top-right, always visible) */}
        <div className="absolute right-4 top-2 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-xl shadow-sm" style={{ backgroundColor: "white", padding: "8px 14px", minHeight: 36, minWidth: 140 }}>
            <span style={{ width: 12, height: 12, backgroundColor: "black", borderRadius: 9999, display: "inline-block" }} />
            <span className="text-[13px] font-extrabold tracking-wide text-black">{displayName}</span>
          </div>
          <button onClick={logout} className="rounded-xl font-extrabold"
            style={{ backgroundColor: "white", color: "#ff4040", padding: "8px 18px", minWidth: 140, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            LOG OUT
          </button>
        </div>
      </header>

      {/* back arrow */}
      <div className="pt-4 pl-8">
        <button onClick={() => router.back()} aria-label="Back" className="p-2 rounded-lg hover:bg-black/5 active:scale-95 transition" title="Back">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="h-6 w-6">
            <path fillRule="evenodd" d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* big rounded panel */}
      <section className="rounded-[28px] shadow-sm"
        style={{ backgroundColor: "#45B4F4", marginLeft: 140, marginRight: 140, paddingTop: 28, paddingBottom: 28 }}>
        <h2 className="text-center text-[22px] md:text-[24px] font-extrabold tracking-wide text-black">ABOUT US</h2>
        <div style={{ height: 300 }} />
      </section>

      <div style={{ height: 120 }} />
    </div>
  );
}
