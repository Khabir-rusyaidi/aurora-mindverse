"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function ContactPage() {
  const router = useRouter();
  const userName = useCurrentUser();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      {/* Top bar */}
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>

        <div className="nav-right">
          <div className="nav-links" />
          <div style={{ position: "relative" }}>
            <button className="profile-pill" onClick={() => setShowLogout(v => !v)}>
              <span className="profile-icon">👤</span> {userName}
            </button>
            {showLogout && (
              <button
                onClick={handleLogout}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 42,
                  background: "#fff",
                  color: "#e53935",
                  border: "1px solid rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                LOG OUT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Back arrow */}
      <button
        aria-label="Back"
        onClick={() => router.back()}
        style={{
          border: "none",
          background: "transparent",
          fontSize: 22,
          cursor: "pointer",
          margin: "8px 0 0 14px",
        }}
      >
        ←
      </button>

      {/* --- CENTERED CONTACT CARD (guaranteed) --- */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <div
          style={{
            width: "80%",
            maxWidth: 900,
            background: "#3eb2ff",
            borderRadius: 28,
            boxShadow: "0 8px 18px rgba(0,0,0,.2)",
            padding: 28,
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.6rem",
              fontWeight: 900,
              margin: "0 0 18px 0",
            }}
          >
            CONTACT US
          </h2>

          <div
            style={{
              background: "#5cc0fd",
              border: "1.5px solid rgba(0,0,0,0.5)",
              borderRadius: 10,
              padding: "12px 16px",
              margin: "14px 10px",
              fontWeight: 700,
            }}
          >
            MUHAMAD HAZIQ FAKHRI BIN MOHD YUSRI (011-39989975)
          </div>

          <div
            style={{
              background: "#5cc0fd",
              border: "1.5px solid rgba(0,0,0,0.5)",
              borderRadius: 10,
              padding: "12px 16px",
              margin: "14px 10px",
              fontWeight: 700,
            }}
          >
            KHABIR RUSYAIDI BIN KAMARUR HANIM (018-4011862)
          </div>

          <div
            style={{
              background: "#5cc0fd",
              border: "1.5px solid rgba(0,0,0,0.5)",
              borderRadius: 10,
              padding: "12px 16px",
              margin: "14px 10px",
              fontWeight: 700,
            }}
          >
            MOHAMAD FIRDAUS BIN TASRIPIN (016-6368092)
          </div>
        </div>
      </div>
      {/* --- END CARD --- */}
    </div>
  );
}

