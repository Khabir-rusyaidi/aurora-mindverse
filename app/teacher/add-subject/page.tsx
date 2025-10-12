"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddSubjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");           // Artsteps URL (optional)
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // profile dropdown state
  const [showLogout, setShowLogout] = useState(false);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // back to login
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      alert("Please enter Title and Description.");
      return;
    }

    setIsSaving(true);
    try {
      // must be logged in
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) { alert("You must be logged in."); return; }
      const uid = userRes.user.id;

      // upload image (optional)
      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${uid}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("subjects").upload(path, file);
        if (upErr) { alert("Upload failed: " + upErr.message); return; }
        const { data: pub } = supabase.storage.from("subjects").getPublicUrl(path);
        imageUrl = pub?.publicUrl ?? null;
      }

      // insert row (NO teacher_id — DB trigger sets it to auth.uid())
      const { error: insErr } = await supabase.from("subjects").insert({
        title: title.trim(),
        description: desc.trim(),
        image_url: imageUrl,
        artsteps_url: link.trim() || null,
      });

      if (insErr) { alert(insErr.message); return; }

      alert("Subject created!");
      router.push("/teacher");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* top bar (same look; add About/Contact + Profile dropdown) */}
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title" style={{ marginTop: 0, textAlign: "left" }}>AURORA MIND VERSE</h1>
          <p className="amv-subtitle" style={{ marginTop: 2, textAlign: "left" }}>STEP INTO THE NEW ERA</p>
        </div>

        <div className="nav-right">
          <div className="nav-links">
            <a href="/about">About Us</a>
            &nbsp;&nbsp;
            <a href="/contact">Contact</a>
          </div>

          {/* profile pill + toggle logout (inline style so no CSS changes needed) */}
          <div style={{ position: "relative" }}>
            <button
              className="profile-pill"
              onClick={() => setShowLogout(v => !v)}
            >
              <span className="profile-icon">👤</span> FIRDAUS
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

      {/* back button (outside, left) */}
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

      {/* create subject card (unchanged UI) */}
      <div className="create-card" style={{ width: "90%", maxWidth: 1150 }}>
        <h2 className="create-title">CREATE SUBJECT</h2>
        <form onSubmit={handleSubmit} className="create-grid">
          <input
            type="text" placeholder="Subject Name"
            value={title} onChange={(e)=>setTitle(e.target.value)} required
          />
          <input
            type="text" placeholder="Description"
            value={desc} onChange={(e)=>setDesc(e.target.value)} required
          />
          <input
            type="url" placeholder="link artsteps"
            value={link} onChange={(e)=>setLink(e.target.value)}
          />
          <input
            type="file" accept="image/*"
            onChange={(e)=>setFile(e.target.files?.[0] ?? null)}
          />

          <button type="submit" className="login-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "CREATE"}
          </button>
        </form>
      </div>
    </div>
  );
}

