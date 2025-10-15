"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch current user
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
    <div className="min-h-screen w-full bg-[#6BC6FF] flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full bg-[#3FA9F5] flex justify-between items-center px-8 py-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-black">AURORA MIND VERSE</h1>
          <p className="text-[14px] font-semibold text-black -mt-1">STEP INTO THE NEW ERA</p>
        </div>

        {/* PROFILE + LOGOUT */}
        <div className="relative flex flex-col items-end">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-2 bg-white px-4 py-1 rounded-xl"
          >
            <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
            <span className="font-semibold text-sm text-black">{displayName}</span>
          </button>
          {menuOpen && (
            <button
              onClick={logout}
              className="mt-1 bg-white text-red-600 font-bold text-sm px-4 py-1 rounded-xl"
            >
              LOG OUT
            </button>
          )}
        </div>
      </div>

      {/* BACK ARROW */}
      <div className="w-full max-w-[1280px] flex items-start mt-4 px-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded hover:bg-black/10 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="w-6 h-6">
            <path
              fillRule="evenodd"
              d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* ABOUT US BOX */}
      <div className="flex justify-center w-full mt-2">
        <div className="bg-[#3FA9F5] w-[85%] sm:w-[80%] rounded-[28px] py-12 flex flex-col items-center">
          <h2 className="text-[22px] sm:text-[24px] font-extrabold text-black">ABOUT US</h2>
        </div>
      </div>
    </div>
  );
}
