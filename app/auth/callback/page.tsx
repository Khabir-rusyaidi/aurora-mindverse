"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // small pause so users see the message, then go to login
    const t = setTimeout(() => router.replace("/"), 1200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ width: "90%", maxWidth: 700, margin: "60px auto", textAlign: "center" }}>
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <div className="form-card">
        <h2 className="welcome-title" style={{ marginTop: 0 }}>Email confirmed</h2>
        <p className="welcome-text">
          Thanks! We’ve verified your email. Redirecting you to the login page…
        </p>
        <p className="welcome-text" style={{ marginTop: 12 }}>
          If nothing happens, <a href="/" style={{ fontWeight: 700 }}>click here</a>.
        </p>
      </div>
    </div>
  );
}
