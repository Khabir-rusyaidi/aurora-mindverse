"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = search.get("code");
    const type = search.get("type");

    if (code && type === "recovery") {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setMessage(error.message);
        }
        setReady(true);
      });
    } else {
      setMessage("Invalid or missing recovery code.");
    }
  }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    if (password.length < 8) {
      return alert("Password must be at least 8 characters");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      alert("Password updated successfully. Redirecting to login...");
      setTimeout(() => router.replace("/"), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="fp-root">
      <div className="fp-column">
        <div className="fp-inner">
          <h1 className="fp-brand">AURORA MIND VERSE</h1>
          <p className="fp-tagline">STEP INTO THE NEW ERA</p>

          <div className="fp-card">
            <div className="fp-card-back">
              <Link href="/" aria-label="Back to login">
                <span className="fp-arrow-box">←</span>
              </Link>
            </div>

            <h2 className="fp-title">SET NEW PASSWORD</h2>
            <p className="fp-sub">Enter your new password below</p>

            {!ready ? (
              <p style={{ textAlign: "center", marginTop: "40px" }}>
                Preparing reset...
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  className="fp-input"
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  className="fp-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="fp-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            )}

            {message && (
              <p
                style={{
                  textAlign: "center",
                  color: "#000",
                  marginTop: "10px",
                  fontWeight: 500,
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
