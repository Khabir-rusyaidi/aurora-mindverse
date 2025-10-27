"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

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
    if (loading || cooldown > 0) return;

    setLoading(true);
    setOtpSent(false);

    try {
      const r = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();

      if (!r.ok || !j.ok) {
        // If throttled, server returns "Please wait XXs ..."
        const waitMatch = /(\d+)s/.exec(j.error || "");
        if (waitMatch) setCooldown(parseInt(waitMatch[1], 10));
        alert(j.error || "Failed to send code");
        return;
      }

      setOtpSent(true);
      setCooldown(30); // same as server throttle
      alert("OTP sent! Check your email.");
    } catch (e: any) {
      alert(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword() {
    if (!email) return alert("Enter your email");
    if (!otp || otp.length !== 6) return alert("Enter the 6-digit OTP");
    if (pwd.length < 8) return alert("Password must be at least 8 characters");
    if (pwd !== pwd2) return alert("Passwords do not match");

    setLoading(true);
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword: pwd }),
      });
      const j = await r.json();

      if (!r.ok || !j.ok) {
        alert(j.error || "Failed to update password");
        return;
      }

      alert("Password updated. Please log in with your new password.");
      router.replace("/"); // back to login
    } catch (e: any) {
      alert(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fp-root">
      <div className="fp-column">
        <div className="fp-inner">
          <h1 className="fp-brand">AURORA MIND VERSE</h1>
          <p className="fp-tagline">STEP INTO THE NEW ERA</p>

          <div className="fp-card">
            {/* Back arrow inside the card */}
            <div className="fp-card-back">
              <Link href="/" aria-label="Back to login">
                <span className="fp-arrow-box">←</span>
              </Link>
            </div>

            <h2 className="fp-title">RESET YOUR PASSWORD</h2>
            <p className="fp-sub">We&apos;ll send a secure code to your email</p>

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
                placeholder="Enter 6-digit OTP"
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

      {/* === Inline style to match your design === */}
      <style jsx global>{`
        .fp-root {
          min-height: 100vh;
          background: #77c9ff;
          display: grid;
          place-items: start center;
          font-family: "Poppins", sans-serif;
        }
        .fp-column {
          background: #77c9ff;
          width: 760px;
          min-height: 100vh;
        }
        .fp-inner {
          max-width: 760px;
          margin: 36px auto 64px;
          padding: 0 24px;
          position: relative;
        }
        .fp-brand {
          text-align: center;
          color: #000;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: 1px;
          margin: 4px 0;
        }
        .fp-tagline {
          text-align: center;
          color: #000;
          font-size: 13px;
          margin-bottom: 25px;
          letter-spacing: 1px;
        }
        .fp-card {
          background: #40b7ff;
          border-radius: 30px;
          padding: 28px 32px 32px;
          width: 720px;
          margin: 0 auto;
          position: relative;
          border: none;
        }
        .fp-card-back {
          position: absolute;
          top: 18px;
          left: 18px;
        }
        .fp-arrow-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1.5px solid #000;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 500;
          color: #000;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .fp-arrow-box:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        .fp-title {
          color: #000;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 5px;
        }
        .fp-sub {
          color: #000;
          text-align: center;
          font-size: 14px;
          margin-bottom: 18px;
        }
        .fp-input {
          width: 100%;
          background: #77c9ff;
          border: 1px solid #000;
          border-radius: 6px;
          height: 42px;
          outline: none;
          color: #000;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 0 10px;
        }
        .fp-row {
          display: flex;
          gap: 5px;
          width: 100%;
          margin-bottom: 15px;
        }
        .fp-grow {
          flex: 1;
        }
        .fp-resend {
          height: 42px;
          background: #3a55c8;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          border: 1px solid #000;
          border-radius: 6px;
          padding: 0 14px;
          cursor: pointer;
        }
        .fp-resend:hover {
          background: #334ac0;
        }
        .fp-submit {
          background: #3a55c8;
          color: #fff;
          border: 1px solid #000;
          border-radius: 6px;
          font-weight: 700;
          width: 100%;
          height: 45px;
          font-size: 15px;
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .fp-submit:hover {
          background: #334ac0;
        }
      `}</style>
    </div>
  );
}
