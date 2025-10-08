"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Subject = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  artsteps_url: string | null;
};

type UserMeta = { role?: "teacher" | "student" };

export default function TeacherDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u) { router.push("/"); return; }

      const role = (u.user_metadata as UserMeta)?.role;
      if (role !== "teacher") { router.push("/"); return; }

      setEmail(u.email ?? null);

      const { data: rows, error } = await supabase
        .from("subjects")
        .select("id,title,description,image_url,artsteps_url")
        .eq("teacher_id", u.id)
        .order("created_at", { ascending: false });

      if (!error && rows) setSubjects(rows as Subject[]);
      setLoading(false);
    })();
  }, [router]);

  const displayName = (email ?? "").split("@")[0].toUpperCase();

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
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
          <div className="profile-pill">
            <span className="profile-icon">👤</span>
            {displayName || "TEACHER"}
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <h2 className="welcome-title">Welcome To Our Application</h2>
        <hr className="divider" />
        <p className="welcome-text">
          Through this website platform, students will not only read or watch learning materials passively but
          they will also be able to walk inside a virtual world like a video game to explore the topics provided.
        </p>

        <div className="actions-right below-right">
          <a className="pill-btn" href="https://www.artsteps.com/" target="_blank" rel="noreferrer">
            <span className="plus">+</span> Create Artsteps
          </a>
          <Link href="/teacher/add-subject" className="pill-btn">
            <span className="plus">+</span> Add Subject
          </Link>
        </div>
      </div>

      <div style={{ width: "90%", margin: "18px auto 0 auto" }}>
        <h2 style={{ margin: "12px 0 16px 0" }}>My Subject</h2>

        {loading && <p>Loading...</p>}
        {!loading && subjects.length === 0 && (
          <p style={{ opacity: 0.8 }}>No subjects yet. Click <strong>Add Subject</strong> to create one.</p>
        )}

        {!loading && subjects.map((s) => (
          <div key={s.id} className="subject-row" style={{ marginBottom: 16 }}>
            <div className="subject-thumb">
              {s.image_url ? <img src={s.image_url} alt={s.title} /> : "ADD PICTURE"}
            </div>

            <div className="subject-main">
              <h3>{s.title}</h3>
              <p style={{ opacity: 0.9 }}>{s.description}</p>
            </div>

            <div className="subject-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link className="edit-link" href={`/teacher/subject/${s.id}/edit`}>✎ Edit</Link>
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
