"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function ContactPage() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const userName = useCurrentUser(); // <<— shows FIRDAUS / TAY, etc.

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // back to login
  };

  return (
    <div style={{ width: "100%" }}>
      {/* top bar */}
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title" style={{ marginTop: 0, textAlign: "left" }}>AURORA MIND VERSE</h1>
          <p className="amv-subtitle" style={{ marginTop: 2, textAlign: "left" }}>STEP INTO THE NEW ERA</p>
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
                  position: "absolute", right: 0, top: 42,
                  background: "#fff", color: "#e53935",
                  border: "1px solid rgba(0,0,0,0.15)",
                  padding: "8px 12px", borderRadius: 10,
                  fontWeight: 800, cursor: "pointer"
                }}
              >
                LOG OUT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* back button */}
      <button
        aria-label="Back"
        onClick={() => router.back()}
        style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", margin: "8px 0 0 14px" }}
      >
        ←
      </button>

      {/* content card */}
      <div className="panel" style={{ width: "90%", maxWidth: 1150 }}>
        <h2 className="panel-title">CONTACT US</h2>
        <div className="row-pill">MUHAMAD HAZIQ FAKHRI BIN MOHD YUSRI (011-39989975)</div>
        <div className="row-pill">KHABIR RUSYAIDI BIN KAMARUR HANIM (018-4011862)</div>
        <div className="row-pill">MOHAMAD FIRDAUS BIN TASRIPIN (016-6368092)</div>
      </div>
    </div>
  );
}
