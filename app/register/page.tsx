"use client";

import React, { useState } from "react";
import "../globals.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = "student" | "teacher" | "";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    // basic validation
    if (!role || !email || !password || !password2) {
      alert("Please fill in all required fields.");
      return;
    }
    if (password !== password2) {
      alert("Passwords do not match.");
      return;
    }

    // teacher code check
    if (role === "teacher") {
      const expected =
        process.env.NEXT_PUBLIC_TEACHER_CODE ||
        process.env.TEACHER_CODE ||
        "";

      if (!expected) {
        alert("Teacher code not configured in environment variables.");
        return;
      }
      if (teacherCode.trim() !== expected.trim()) {
        alert("Invalid teacher code.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }, // save role in user metadata
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Registration successful! Please check your email to verify (if required).");
      router.replace("/"); // back to login
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <h2 className="register-heading">REGISTER</h2>

      <div className="form-card">
        <form onSubmit={onSubmit} className="register-grid">
          {/* Role */}
          <select
            className="full"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="" disabled>
              Please select your role
            </option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {/* Email */}
          <input
            className="full"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Passwords */}
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Re-type Password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />

          {/* Teacher code (optional unless role=teacher) */}
          <input
            type="text"
            placeholder="If teacher enter code here"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value)}
          />

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
