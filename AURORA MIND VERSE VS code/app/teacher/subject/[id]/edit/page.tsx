"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserMeta = { role?: "teacher" | "student" };

type SubjectRow = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  artsteps_url: string | null;
  teacher_id: string;
};

function pathFromPublicUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/object/public/subjects/");
    return parts.length === 2 ? decodeURIComponent(parts[1]) : null;
  } catch {
    return null;
  }
}

export default function EditSubjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      // must be signed in & teacher
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        router.replace("/");
        return;
      }
      const role = (user.user_metadata as UserMeta)?.role;
      if (role !== "teacher") {
        router.replace("/");
        return;
      }

      // load the subject row (owned by this teacher)
      const { data, error } = await supabase
        .from("subjects")
        .select("id,title,description,image_url,artsteps_url,teacher_id")
        .eq("id", params.id)
        .eq("teacher_id", user.id)
        .single();

      if (error || !data) {
        alert("Subject not found or you do not have permission.");
        router.replace("/teacher");
        return;
      }

      const s = data as SubjectRow;
      setTitle(s.title);
      setDesc(s.description);
      setLink(s.artsteps_url ?? "");
      setCurrentImageUrl(s.image_url ?? null);
      setLoading(false);
    })();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    if (!title.trim() || !desc.trim()) {
      alert("Please fill Title and Description.");
      return;
    }

    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        alert("Not signed in.");
        return;
      }

      // If a new image is chosen, upload it first
      let nextImageUrl: string | null | undefined = undefined; // undefined = don't change; null = clear
      if (newFile) {
        const ext = newFile.name.split(".").pop() || "jpg";
        const path = `${uid}/${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage.from("subjects").upload(path, newFile);
        if (upErr) {
          alert(`Upload failed: ${upErr.message}`);
          return;
        }
        const { data: pub } = supabase.storage.from("subjects").getPublicUrl(path);
        nextImageUrl = pub?.publicUrl ?? null;
      }

      // Update the row
      const payload: Partial<SubjectRow> = {
        title: title.trim(),
        description: desc.trim(),
        artsteps_url: link.trim() || null,
      };
      if (nextImageUrl !== undefined) {
        payload.image_url = nextImageUrl;
      }

      const { error: updErr } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", params.id)
        .eq("teacher_id", uid);

      if (updErr) {
        alert(updErr.message);
        return;
      }

      // If image was replaced successfully, delete the old one
      if (nextImageUrl && currentImageUrl) {
        const oldPath = pathFromPublicUrl(currentImageUrl);
        if (oldPath) {
          await supabase.storage.from("subjects").remove([oldPath]);
        }
      }

      alert("Saved!");
      router.replace("/teacher");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width: "90%", maxWidth: 900, margin: "60px auto" }}>
        <h1 className="amv-title">AURORA MIND VERSE</h1>
        <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        <div className="form-card">
          <p className="welcome-text">Loading subject…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "95%", maxWidth: 1000, margin: "0 auto" }}>
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>
      </div>

      <div className="form-card" style={{ marginTop: 20 }}>
        <h2 className="create-title">EDIT SUBJECT</h2>

        <form onSubmit={handleSave} className="create-grid">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />

          <input
            type="url"
            placeholder="Artsteps link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          <div className="full" style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 700 }}>Current image</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="subject"
                  style={{ width: 180, height: 120, objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <span style={{ opacity: 0.8 }}>No image</span>
              )}
            </div>

            <label style={{ fontWeight: 700, marginTop: 6 }}>
              Replace image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="full" style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button type="submit" className="login-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>

            <Link
              href="/teacher"
              className="pill-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
