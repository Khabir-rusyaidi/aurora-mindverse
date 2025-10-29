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

/** Simple trash outline icon */
function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...props}>
      <path
        d="M3 6h18M9 6V4h6v2M7 6l1 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2L17 6M10 11v6M14 11v6"
        stroke="currentColor" strokeWidth={2} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const userName = useCurrentUser();                   // 👈 shows FIRDAUS/TAY etc.
  const [showLogout, setShowLogout] = useState(false); // 👈 toggle dropdown

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const [myId, setMyId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current user + subjects
  useEffect(() => {
    (async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const u = userRes?.user;
      if (userErr || !u) { router.replace("/"); return; }

      const role = (u.user_metadata as UserMeta)?.role;
      if (role !== "teacher") { router.replace("/"); return; }

      setMyId(u.id);

      const { data: rows, error } = await supabase
        .from("subjects")
        .select("id,title,description,image_url,artsteps_url,teacher_id")
        .order("created_at", { ascending: false });

      if (!error && rows) setSubjects(rows as Subject[]);
      setLoading(false);
    })();
  }, [router]);

  // Delete (owner only; RLS enforces too)
  const handleDelete = async (subject: Subject) => {
    if (!myId) return;
    const ok = window.confirm(Delete "${subject.title}"? This cannot be undone.);
    if (!ok) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subject.id)
      .eq("teacher_id", myId);

    if (error) { alert(error.message); return; }
    setSubjects(prev => prev.filter(s => s.id !== subject.id));
    alert("Subject deleted.");
  };

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
      {/* === TOP BAR === */}
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

      {/* === WELCOME === */}
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome To Our Application</h2>
        <hr className="divider" />
        <p className="welcome-text">
          Through this website platform, students will not only read or watch learning materials passively but
          they will also be able to walk inside a virtual world like a video game to explore the topics provided.
        </p>

        <div className="actions-right below-right">
          <a className="pill-btn" href="https://metasteps.com/" target="_blank" rel="noreferrer">
            <span className="plus">+</span> Create Metasteps
          </a>
          <Link href="/teacher/add-subject" className="pill-btn">
            <span className="plus">+</span> Add Subject
          </Link>
        </div>
      </div>

      {/* === SUBJECTS === */}
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
              {s.teacher_id === myId ? (
                <>
                  <Link className="edit-link" href={/teacher/subject/${s.id}/edit}>
                    <span style={{ marginRight: 6 }}>✎</span> Edit
                  </Link>

                  <button
                    type="button"
                    className="delete-link"
                    onClick={() => handleDelete(s)}
                    aria-label={Delete ${s.title}}
                  >
                    <TrashIcon className="trash-svg" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <span style={{ opacity: 0.7, fontSize: 12 }}>by another teacher</span>
              )}

              <button
                className="enter-btn"
                onClick={() =>
                  s.artsteps_url
                    ? window.open(s.artsteps_url, "_blank")
                    : alert("No Artsteps link yet. Add it in Edit.")
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