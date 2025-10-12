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
      // TODO: call your API here
      await new Promise((r) => setTimeout(r, 500));
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
          {/* BACK ARROW (plain, no circle) */}
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

      {/* ===== Arrow de-circle + exact look overrides ===== */}
      <style jsx global>{`
        .fp-back {
          margin-left: 40px;
          margin-bottom: 10px;
        }
        /* Nuke any default styles that add the black circle */
        .fp-back a,
        .fp-back a * {
          all: unset;
          cursor: pointer;
        }
        .fp-arrow {
          display: inline-block;
          font-size: 20px;
          font-weight: 500;
          color: #000;
          line-height: 1;
          background: none !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        /* (Optional) keep rest of your current styles; below are safe tweaks
           to keep it matching your reference exactly. Comment out if not needed. */
        .fp-root { background: #77c9ff; }
        .fp-column { background: #77c9ff; }
        .fp-card {
          background: #40b7ff;
          border-radius: 30px;
          box-shadow: none;
          border: none;
        }
        .fp-input {
          background: #77c9ff;
          border: 1px solid #000;
          border-radius: 6px;
          height: 42px;
          box-shadow: none;
          color: #000;
          font-size: 14px;
        }
        .fp-row { gap: 5px; }
        .fp-resend,
        .fp-submit {
          background: #3a55c8;
          border: 1px solid #000;
          border-radius: 6px;
          box-shadow: none;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .fp-resend { height: 42px; padding: 0 14px; font-size: 15px; }
        .fp-submit { height: 45px; width: 100%; font-size: 15px; }
      `}</style>
    </div>
  );
}
