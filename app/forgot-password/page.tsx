"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // countdown for RESEND (server also enforces 60s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOrResendOtp() {
    if (!email) return;
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const r = await fetch("/api/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d: { cooldown?: number; error?: string } = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to send OTP");
      setOtpSent(true);
      if (typeof d.cooldown === "number") setCooldown(d.cooldown);
      setMsg("OTP sent. It expires in 10 minutes.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword() {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      if (!otp || otp.length !== 6) throw new Error("Please enter 6-digit OTP");
      if (pwd.length < 8) throw new Error("Password must be at least 8 characters");
      if (pwd !== pwd2) throw new Error("Passwords do not match");

      const r = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword: pwd }),
      });
      const d: { error?: string } = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to reset password");
      setMsg("Password updated. You can now log in.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fp-page">
      {/* Central band with the back arrow inside */}
      <div className="fp-rail">
        <div className="fp-back">
          <Link href="/" aria-label="Back to login">
            <span>←</span>
          </Link>
        </div>

        {/* Headings */}
        <h1 className="fp-brand">AURORA MIND VERSE</h1>
        <p className="fp-tagline">STEP INTO THE NEW ERA</p>

        {/* Card */}
        <div className="fp-card">
          <h2 className="fp-title">RESET YOUR PASSWORD</h2>
          <p className="fp-sub">We&apos;ll send a secure link to your email</p>

          <div className="fp-form">
            <input
              className="fp-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="fp-row">
              <input
                className="fp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Send OTP number"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <button
                className="fp-resend"
                onClick={sendOrResendOtp}
                disabled={loading || !email || cooldown > 0}
              >
                {cooldown > 0 ? `RESEND (${cooldown})` : "RESEND"}
              </button>
            </div>

            {/* Show password fields after OTP is sent (keeps UI same height initially) */}
            {otpSent && (
              <>
                <input
                  className="fp-input"
                  type="password"
                  placeholder="New password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <input
                  className="fp-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
              </>
            )}

            <button
              className="fp-submit"
              onClick={submitNewPassword}
              disabled={loading}
            >
              SUBMIT
            </button>

            {msg && <p className="fp-note">{msg}</p>}
            {err && <p className="fp-err">{err}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
