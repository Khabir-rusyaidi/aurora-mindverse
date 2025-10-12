'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOrResendOtp() {
    if (!email) return;
    setLoading(true); setMsg(null); setErr(null);
    try {
      const res = await fetch('/api/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      if (typeof data.cooldown === 'number') setCooldown(data.cooldown);
      setMsg('OTP sent to your email. It expires in 10 minutes.');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword() {
    setLoading(true); setMsg(null); setErr(null);
    try {
      if (!otp || otp.length !== 6) throw new Error('Please enter 6-digit OTP');
      if (pwd.length < 8) throw new Error('Password must be at least 8 characters');
      if (pwd !== pwd2) throw new Error('Passwords do not match');

      const res = await fetch('/api/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setMsg('Password updated. You can now log in.');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sky-300">
      {/* Back arrow */}
      <div className="p-6">
        <Link href="/" aria-label="Back to login" className="inline-block">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white">←</span>
        </Link>
      </div>

      {/* Top title */}
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">AURORA MIND VERSE</h1>
        <p className="mt-1 text-sm font-semibold text-slate-700">STEP INTO THE NEW ERA</p>
      </div>

      {/* Card */}
      <div className="mx-auto mt-10 w-full max-w-3xl rounded-[28px] bg-sky-400/70 p-8 shadow-xl ring-1 ring-sky-500/40">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">RESET YOUR PASSWORD</h2>
        <p className="mt-2 text-center text-slate-800/80">We&apos;ll send a secure link to your email</p>

        <div className="mx-auto mt-6 max-w-2xl space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Enter your emai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-sky-500 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600"
          />

          {/* OTP + RESEND (inline, right) */}
          <div className="flex items-stretch gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Send OTP number"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="flex-1 rounded-lg border border-sky-500 bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-sky-600"
            />
            <button
              onClick={sendOrResendOtp}
              disabled={loading || !email || cooldown > 0}
              className="rounded-lg bg-indigo-700 px-6 py-3 font-extrabold uppercase tracking-wide text-white shadow hover:opacity-95 disabled:opacity-60"
            >
              {cooldown > 0 ? `RESEND (${cooldown})` : 'RESEND'}
            </button>
          </div>

          {/* New password + Confirm (show when OTP sent) */}
          {otpSent && (
            <>
              <input
                type="password"
                placeholder="New password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-lg border border-sky-500 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className="w-full rounded-lg border border-sky-500 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-600"
              />
            </>
          )}

          {/* Submit */}
          <button
            onClick={submitNewPassword}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-700 px-4 py-3 text-lg font-extrabold uppercase text-white shadow hover:opacity-95 disabled:opacity-60"
          >
            SUBMIT
          </button>

          {msg && <p className="text-center text-emerald-700">{msg}</p>}
          {err && <p className="text-center text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}
