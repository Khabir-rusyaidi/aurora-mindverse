"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const styles = {
    page: { minHeight: "100vh", background: "#7bd0ff" },
    container: { maxWidth: 1152, margin: "0 auto", padding: "24px" },
    headerWrap: { textAlign: "center" as const },
    h1: { fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0 },
    sub: { marginTop: 6, fontSize: 14, fontWeight: 600, color: "#334155" },
    card: {
      margin: "40px auto 0",
      width: "100%",
      maxWidth: 900,
      background: "rgba(56, 189, 248, 0.7)",
      borderRadius: 28,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      border: "1px solid rgba(2,132,199,0.4)",
      padding: 32,
    },
    title: { textAlign: "center" as const, fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0 },
    subtitle: { textAlign: "center" as const, marginTop: 8, color: "rgba(30,41,59,0.8)" },
    formWrap: { margin: "24px auto 0", maxWidth: 720 },
    input: {
      width: "100%", borderRadius: 10, border: "1px solid #38bdf8",
      background: "#fff", padding: "12px 16px", outline: "none", fontSize: 16,
    },
    row: { display: "flex", gap: 12, alignItems: "stretch" },
    resendBtn: {
      whiteSpace: "nowrap" as const, border: "none", borderRadius: 10, padding: "12px 18px",
      fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: 0.5,
      color: "#fff", background: "linear-gradient(to bottom, rgb(67,56,202), rgb(79,70,229))",
      boxShadow: "0 6px 16px rgba(0,0,0,0.15)", cursor: "pointer",
    },
    submitBtn: {
      width: "100%", marginTop: 12, border: "none", borderRadius: 10, padding: "14px 18px",
      fontWeight: 800, textTransform: "uppercase" as const, color: "#fff",
      background: "linear-gradient(to bottom, rgb(67,56,202), rgb(79,70,229))",
      boxShadow: "0 8px 18px rgba(0,0,0,0.18)", cursor: "pointer", fontSize: 18,
    },
    back: {
      display: "inline-flex", width: 36, height: 36, alignItems: "center", justifyContent: "center",
      borderRadius: "9999px", background: "rgba(0,0,0,0.85)", color: "#fff", textDecoration: "none",
    },
    backWrap: { padding: 24 },
    note: { textAlign: "center" as const, marginTop: 8, color: "#065f46" },
    error: { textAlign: "center" as const, marginTop: 8, color: "#b91c1c" },
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOrResendOtp() {
    if (!email) return;
    setLoading(true); setMsg(null); setErr(null);
    try {
      const r = await fetch("/api/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d: unknown = await r.json();
      if (!r.ok) throw new Error(typeof d === "object" && d && "error" in (d as Record<string, unknown>) ? String((d as any).error) : "Failed to send OTP");
      setOtpSent(true);
      if (typeof (d as any).cooldown === "number") setCooldown((d as any).cooldown);
      setMsg("OTP sent to your email. It expires in 10 minutes.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword() {
    setLoading(true); setMsg(null); setErr(null);
    try {
      if (!otp || otp.length !== 6) throw new Error("Please enter 6-digit OTP");
      if (pwd.length < 8) throw new Error("Password must be at least 8 characters");
      if (pwd !== pwd2) throw new Error("Passwords do not match");

      const r = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword: pwd }),
      });
      const d: unknown = await r.json();
      if (!r.ok) throw new Error(typeof d === "object" && d && "error" in (d as Record<string, unknown>) ? String((d as any).error) : "Failed to reset password");
      setMsg("Password updated. You can now log in.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backWrap}>
        <Link href="/" aria-label="Back to login" style={styles.back}>←</Link>
      </div>

      <div style={styles.container as React.CSSProperties}>
        <div style={styles.headerWrap}>
          <h1 style={styles.h1}>AURORA MIND VERSE</h1>
          <p style={styles.sub}>STEP INTO THE NEW ERA</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>RESET YOUR PASSWORD</h2>
          <p style={styles.subtitle}>We&apos;ll send a secure link to your email</p>

          <div style={styles.formWrap}>
            <input
              type="email"
              placeholder="Enter your emai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <div style={{ ...styles.row, marginTop: 12 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Send OTP number"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={sendOrResendOtp}
                disabled={loading || !email || cooldown > 0}
                style={{
                  ...styles.resendBtn,
                  opacity: loading || !email || cooldown > 0 ? 0.6 : 1,
                }}
              >
                {cooldown > 0 ? `RESEND (${cooldown})` : "RESEND"}
              </button>
            </div>

            {otpSent && (
              <>
                <div style={{ marginTop: 12 }}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={{ marginTop: 12 }}>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </>
            )}

            <button
              onClick={submitNewPassword}
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
            >
              SUBMIT
            </button>

            {msg && <p style={styles.note}>{msg}</p>}
            {err && <p style={styles.error}>{err}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
