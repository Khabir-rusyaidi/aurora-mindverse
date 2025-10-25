"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function AddSubjectPage() {
  const router = useRouter();
  const userName = useCurrentUser();
  const [showLogout, setShowLogout] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");           // Artsteps URL (optional)
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      alert("Please enter Title and Description.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) { alert("You must be logged in."); return; }
      const uid = userRes.user.id;

      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${uid}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("subjects").upload(path, file);
        if (upErr) { alert("Upload failed: " + upErr.message); return; }
        const { data: pub } = supabase.storage.from("subjects").getPublicUrl(path);
        imageUrl = pub?.publicUrl ?? null;
      }

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
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      {/* top bar */}
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>

        <div className="nav-right">
          <div className="nav-links">
            <a href="/about">About Us</a>
            &nbsp;&nbsp;
            <a href="/contact">Contact</a>
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

      {/* back arrow (left) */}
      <button
        aria-label="Back"
        onClick={() => router.back()}
        style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", margin: "8px 0 0 14px" }}
      >
        ←
      </button>

      {/* form card */}
      <div className="create-card">
        <h2 className="create-title">CREATE SUBJECT</h2>
        <form onSubmit={handleSubmit} className="create-grid">
          <input type="text" placeholder="Subject Name" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          <input type="text" placeholder="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} required />
          <input type="url" placeholder="link metasteps" value={link} onChange={(e)=>setLink(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />

          <button type="submit" className="login-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "CREATE"}
          </button>
        </form>
      </div>
    </div>
  );
}

