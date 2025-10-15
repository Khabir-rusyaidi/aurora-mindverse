"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserInfo = { email: string | null; name: string | null };

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  // Allow this page to escape global centered layout (you already added the CSS hook)
  useEffect(() => {
    document.body.classList.add("amv-fullscreen-about");
    return () => document.body.classList.remove("amv-fullscreen-about");
  }, []);

  // Auth → get display name (email local part as fallback)
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
      {/* full-viewport layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          overflow: "auto",
          backgroundColor: "#8ED0F6", // page bg
          zIndex: 50,
        }}
      >
        {/* HEADER BAR (blue) */}
        <header
          style={{
            width: "100%",
            backgroundColor: "#45B4F4",
            position: "relative",
          }}
        >
          <div style={{ padding: "16px 0", textAlign: "center", userSelect: "none" }}>
            <h1
              style={{
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#000",
                fontSize: 28,
                textTransform: "uppercase",
              }}
            >
              Aurora Mind Verse
            </h1>
            <p
              style={{
                marginTop: -4,
                fontWeight: 800,
                color: "rgba(0,0,0,0.9)",
                fontSize: 14,
                textTransform: "uppercase",
              }}
            >
              Step Into The New Era
            </p>
          </div>

          {/* Profile (top-right). Click to toggle LOG OUT */}
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <button
              onClick={() => setShowLogout((s) => !s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                padding: "8px 14px",
                minHeight: 36,
                minWidth: 150,
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                cursor: "pointer",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            >
              {/* person icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: "black" }}
                aria-hidden
              >
                <path d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12zm0 2c-3.866 0-7 2.91-7 6.5 0 .828.672 1.5 1.5 1.5h11c.828 0 1.5-.672 1.5-1.5 0-3.59-3.134-6.5-7-6.5z" />
              </svg>
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

            {showLogout && (
              <button
                onClick={logout}
                style={{
                  background: "#fff",
                  color: "#ff4040",
                  padding: "8px 18px",
                  minWidth: 150,
                  borderRadius: 12,
                  fontWeight: 800,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.2)",
                }}
              >
                LOG OUT
              </button>
            )}
          </div>
        </header>

        {/* LIGHT BLUE STRIP (full width) */}
        <div
          style={{
            width: "100%",
            height: 40,
            backgroundColor: "#9AD7FF", // slightly lighter strip like your image
          }}
        />

        {/* BACK ARROW (left) */}
        <div style={{ paddingTop: 6, paddingLeft: 24 }}>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            title="Back"
            style={{
              padding: 8,
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              width="22"
              height="22"
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
        <section
          style={{
            backgroundColor: "#45B4F4", // same as header
            marginLeft: 140,
            marginRight: 140,
            marginTop: 8,
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
              textTransform: "uppercase",
            }}
          >
            About Us
          </h2>

          {/* keep empty to match visual height */}
          <div style={{ height: 300 }} />
        </section>

        <div style={{ height: 120 }} />
      </div>
    </>
  );
}
