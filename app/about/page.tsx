"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLogout, setShowLogout] = useState(false); // 👈 control log out visibility

  // Add fullscreen class
  useEffect(() => {
    document.body.classList.add("amv-fullscreen-about");
    return () => document.body.classList.remove("amv-fullscreen-about");
  }, []);

  // Get user session
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
    <>
      <style jsx global>{`
        body.amv-fullscreen-about {
          margin: 0 !important;
          width: 100% !important;
          max-width: none !important;
          overflow-x: hidden !important;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          overflow: "auto",
          backgroundColor: "#8ED0F6",
          zIndex: 50,
        }}
      >
        {/* Header */}
        <header style={{ width: "100%", backgroundColor: "#45B4F4", position: "relative" }}>
          <div style={{ padding: "16px 0", textAlign: "center", userSelect: "none" }}>
            <h1
              style={{
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#000",
                fontSize: "28px",
              }}
            >
              AURORA MIND VERSE
            </h1>
            <p
              style={{
                marginTop: "-4px",
                fontWeight: 800,
                color: "rgba(0,0,0,0.9)",
                fontSize: "14px",
              }}
            >
              STEP INTO THE NEW ERA
            </p>
          </div>

          {/* Profile & Dropdown */}
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {/* Profile button */}
            <button
              onClick={() => setShowLogout((prev) => !prev)} // toggle log out
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                padding: "8px 14px",
                minHeight: 36,
                minWidth: 140,
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "#000",
                  borderRadius: 9999,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  color: "#000",
                  fontSize: 13,
                }}
              >
                {displayName}
              </span>
            </button>

            {/* Log Out appears only when clicked */}
            {showLogout && (
              <button
                onClick={logout}
                style={{
                  background: "#fff",
                  color: "#ff4040",
                  padding: "8px 18px",
                  minWidth: 140,
                  borderRadius: 12,
                  fontWeight: 800,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
              >
                LOG OUT
              </button>
            )}
          </div>
        </header>

        {/* Back Arrow */}
        <div style={{ paddingTop: 16, paddingLeft: 32 }}>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            title="Back"
            style={{
              padding: 8,
              borderRadius: 8,
              background: "transparent",
              border: "2px solid black",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              width="24"
              height="24"
            >
              <path
                fillRule="evenodd"
                d="M10.03 4.47a.75.75 0 0 1 0 1.06L5.56 10h14.19a.75.75 0 0 1 0 1.5H5.56l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* About Box */}
        <section
          style={{
            backgroundColor: "#45B4F4",
            marginLeft: 140,
            marginRight: 140,
            paddingTop: 28,
            paddingBottom: 28,
            borderRadius: 28,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: "#000",
            }}
          >
            ABOUT US
          </h2>
          <div style={{ height: 300 }} />
        </section>

        <div style={{ height: 120 }} />
      </div>
    </>
  );
}
