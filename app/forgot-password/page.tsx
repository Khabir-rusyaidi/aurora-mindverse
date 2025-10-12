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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOtp() {
    if (!email) return alert("Enter your email first");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500)); // fake delay
      setOtpSent(true);
      setCooldown(60);
      alert("OTP sent!");
    } finally {
      setLoading(false);
    }
  }

  function submitNewPassword() {
    if (!otp) return alert("Enter OTP");
    if (pwd.length < 8) return alert("Password must be at least 8 characters");
    if (pwd !== pwd2) return alert("Passwords do not match");
    alert("Password reset successful!");
  }

  return (
    <div className="fp-root">
      <div className="fp-column">
        <div className="fp-inner">
          <div className="fp-back">
            <Link href="/" aria-label="Back to login">
              <span className="fp-arrow">←</span>
            </Link>
          </div>

          <h1 className="fp-brand">AURORA MIND VERSE</h1>
          <p className="fp-tagline">STEP INTO THE NEW ERA</p>

          <div className="fp-card">
            <h2 className="fp-title">RESET YOUR PASSWORD</h2>
            <p className="fp-sub">We&apos;ll send a secure link to your email</p>

            <input
              className="fp-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="fp-row">
              <input
                className="fp-input fp-grow"
                type="text"
                placeholder="Send OTP number"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <button
                className="fp-resend"
                onClick={sendOtp}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `RESEND (${cooldown})` : "RESEND"}
              </button>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
