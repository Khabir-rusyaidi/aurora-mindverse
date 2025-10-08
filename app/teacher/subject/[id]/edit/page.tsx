"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditSubjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 1: Load subject data when page opens
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) { router.push("/"); return; }

      const { data, error } = await supabase
        .from("subjects")
        .select("title,description,image_url,artsteps_url,teacher_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Subject not found");
        router.push("/teacher");
        return;
      }
      if (data.teacher_id !== uid) {
        alert("You can only edit your own subjects");
        router.push("/teacher");
        return;
      }

      setTitle(data.title || "");
      setDesc(data.description || "");
      setLink(data.artsteps_url || "");
      setPreview(data.image_url || null);
    })();
  }, [id, router]);

  // Step 2: Update file preview
  const onFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  // Step 3: Save updates
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) { alert("Not logged in"); return; }

      let imageUrl: string | null | undefined = undefined;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${uid}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("subjects").upload(path, file);
        if (upErr) { alert("Upload failed: " + upErr.message); setSaving(false); return; }
        const { data: pub } = supabase.storage.from("subjects").getPublicUrl(path);
        imageUrl = pub?.publicUrl ?? null;
      }

      const payload: any = {
        title: title.trim(),
        description: desc.trim(),
        artsteps_url: link.trim() || null,
      };
      if (imageUrl !== undefined) payload.image_url = imageUrl;

      const { error } = await supabase.from("subjects").update(payload).eq("id", id);
      if (error) { alert(error.message); return; }

      alert("Subject updated successfully!");
      router.push("/teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>
      </div>

      <div className="create-card">
        <h2 className="create-title">EDIT SUBJECT</h2>
        <form onSubmit={save} className="create-grid">
          <input
            type="text"
            placeholder="Subject Name"
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
            placeholder="link artsteps"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <div style={{ display: "grid", gap: 8 }}>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12 }}
              />
            )}
          </div>

          <button type="submit" className="login-btn" disabled={saving}>
            {saving ? "Saving..." : "SAVE"}
          </button>
        </form>
      </div>
    </div>
  );
}
