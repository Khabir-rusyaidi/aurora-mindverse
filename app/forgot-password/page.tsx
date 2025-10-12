"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOtp() {
    if (!email) return alert("Enter your email first");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // fake delay
      setOtpSent(true);
      setCooldown(60);
      alert("OTP sent! Check your email.");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword() {
    if (!otp) return alert("Enter OTP");
    if (pwd.length < 8) return alert("Password must be at least 8 characters");
    if (pwd !== pwd2) return alert("Passwords do not match");
    alert("Password reset successful!");
  }

  return (
    <div className="forgot-wrapper">
      <div className="forgot-arrow">
        <Link href="/">
          <span className="arrow-icon">←</span>
        </Link>
      </div>

      <h1 className="forgot-brand">AURORA MIND VERSE</h1>
      <p className="forgot-tagline">STEP INTO THE NEW ERA</p>

      <div className="forgot-card">
        <h2 className="forgot-title">RESET YOUR PASSWORD</h2>
        <p className="forgot-sub">We'll send a secure link to your email</p>

        <input
          className="forgot-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="forgot-row">
          <input
            className="forgot-input"
            type="text"
            placeholder="Send OTP number"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
          <button
            className="forgot-resend"
            onClick={sendOtp}
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0 ? `RESEND (${cooldown})` : "RESEND"}
          </button>
        </div>

        {otpSent && (
          <>
            <input
              className="forgot-input"
              type="password"
              placeholder="New password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <input
              className="forgot-input"
              type="password"
              placeholder="Confirm new password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
            />
          </>
        )}

        <button
          className="forgot-submit"
          onClick={submitNewPassword}
          disabled={loading}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
