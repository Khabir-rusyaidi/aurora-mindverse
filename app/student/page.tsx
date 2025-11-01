"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";

type UserMeta = { role?: "teacher" | "student" };

type Subject = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  artsteps_url: string | null;
  teacher_id: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const userName = useCurrentUser();                   // 👈 shows display name (same as teacher page)
  const [showLogout, setShowLogout] = useState(false); // 👈 toggle dropdown

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // Load current user + subjects (view-only)
  useEffect(() => {
    (async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const u = userRes?.user;
      if (userErr || !u) { router.replace("/"); return; }

      const role = (u.user_metadata as UserMeta)?.role;
      // ✅ Only allow students here
      if (role !== "student") { router.replace("/"); return; }

      // Load subjects (same schema as teacher page)
      // If you later add an is_published flag, you can chain `.eq("is_published", true)`
      const { data: rows, error } = await supabase
        .from("subjects")
        .select("id,title,description,image_url,artsteps_url,teacher_id")
        .order("created_at", { ascending: false });

      if (!error && rows) setSubjects(rows as Subject[]);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
        <div className="topbar">
          <div className="brand-block">
            <h1 className="amv-title">AURORA MIND VERSE</h1>
            <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
          </div>
          <div className="nav-right">
            <div className="nav-links"><Link href="/about">About Us</Link>&nbsp;&nbsp;<Link href="/contact">Contact</Link></div>
            <div className="profile-container">
              <button className="profile-pill"><span className="profile-icon">👤</span> {userName}</button>
            </div>
          </div>
        </div>
        <p className="welcome-text" style={{ marginTop: 24 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      {/* === TOP BAR (same as Teacher) === */}
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>

        <div className="nav-right">
          <div className="nav-links">
            <Link href="/about">About Us</Link>
            &nbsp;&nbsp;
            <Link href="/contact">Contact</Link>
          </div>

          <div className="profile-container">
            <button className="profile-pill" onClick={() => setShowLogout(v => !v)}>
              <span className="profile-icon">👤</span> {userName}
            </button>
            {showLogout && (
              <button className="logout-btn" onClick={handleLogout}>LOG OUT</button>
            )}
          </div>
        </div>
      </div>

      {/* === WELCOME (mirrors Teacher text; no action buttons) === */}
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome To Our Website</h2>
        <hr className="divider" />
        <p className="welcome-text">
          Through this website platform, students will not only read or watch learning materials passively but
          they will also be able to walk inside a virtual world like a video game to explore the topics provided.
        </p>

        {/* 🚫 No Create Artsteps / Add Subject for students */}
      </div>

      {/* === SUBJECTS (view-only, no Edit/Delete) === */}
      <div style={{ width: "90%", margin: "18px auto 0 auto" }}>
        <h2 style={{ margin: "12px 0 16px 0" }}>My Subject</h2>
        {!subjects.length && (<p style={{ opacity: 0.8 }}>No subjects yet.</p>)}

        {subjects.map((s) => (
          <div key={s.id} className="subject-row" style={{ marginBottom: 16 }}>
            <div className="subject-thumb">
              {s.image_url ? <img src={s.image_url} alt={s.title} /> : "ADD PICTURE"}
            </div>

            <div className="subject-main">
              <h3>{s.title}</h3>
              <p style={{ opacity: 0.9 }}>{s.description}</p>
            </div>

            <div className="subject-actions">
              {/* 🚫 No edit/delete controls for students */}

              <button
                className="enter-btn"
                onClick={() =>
                  s.artsteps_url
                    ? window.open(s.artsteps_url, "_blank")
                    : alert("No Artsteps link yet. Please check again later.")
                }
              >
                ENTER SUBJECT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
