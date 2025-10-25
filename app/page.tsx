"use client";

import React, { useState } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Role = "teacher" | "student";
type UserMeta = { role?: Role; name?: string };

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value.trim();
    const password = (form.querySelector('input[type="password"]') as HTMLInputElement)?.value;

    // 🔹 NEW: read selected role from the <select>
    const selectedRole = (form.querySelector("select") as HTMLSelectElement)?.value as Role | "";

    if (!email || !password) {
      alert("Please fill in email and password.");
      return;
    }

    // 🔹 NEW: block login when role is not selected
    if (!selectedRole) {
      alert("Please select your role before logging in.");
      return;
    }

    setLoading(true);
    try {
      // 1) Sign in
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        alert(signInErr.message || "Invalid email or password.");
        return;
      }

      // 2) (Optional) You still fetch user; not strictly needed for role check
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        alert("Could not load your account. Please try again.");
        return;
      }

      // 🔹 Use the role the user selected (no defaulting)
      const role: Role = selectedRole as Role;

      // 3) Store role (same as before)
      document.cookie = `amv-role=${role}; Path=/; Max-Age=86400; SameSite=Lax`;

      // 4) Clean form and redirect by role
      form.reset();
      router.replace(role === "teacher" ? "/teacher" : "/student");
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
          Through this website platform, students will not only read or watch learning materials passively
          but they will also be able to walk inside a virtual world like a video game to explore the topics provided.
        </p>
      </div>

      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter email" required />
          <input type="password" placeholder="Enter password" required />

          {/* This select stays the same visually; now it's enforced by handleSubmit */}
          <select>
            <option value="">Role (optional)</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <div className="links">
            <Link href="/register">Register now</Link>
            <Link href="/forgot-password" className="forgot">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
