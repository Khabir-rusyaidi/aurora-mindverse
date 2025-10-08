"use client";

import React, { useState } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserMeta = { role?: "teacher" | "student" };

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value.trim();
    const password = (form.querySelector('input[type="password"]') as HTMLInputElement)?.value;

    if (!email || !password) {
      alert("Please fill in email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert(error.message || "Invalid email or password.");
        return;
      }

      const role = (data.user?.user_metadata as UserMeta)?.role;
      if (!role) {
        alert('This account has no role set. Ask admin to set {"role":"teacher"} or {"role":"student"} in Supabase.');
        return;
      }

      router.replace(role === "teacher" ? "/teacher" : "/student");
      form.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <div className="welcome-section">
        <h2 className="welcome-title">Welcome To Our Application</h2>
        <hr className="divider" />
        <p className="welcome-text">
          Through this website platform, students will not only read or watch
          learning materials passively but they will also be able to walk inside
          a virtual world like a video game to explore the topics provided.
        </p>
      </div>

      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter email" required />
          <input type="password" placeholder="Enter password" required />

          {/* optional UI only; not used for auth logic */}
          <select>
            <option value="">Role (optional)</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <div className="links">
            <a href="/register">Register now</a>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

