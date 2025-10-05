"use client";

import React from "react";
import "../globals.css";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const role = (form.querySelector("select") as HTMLSelectElement)?.value;
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value;
    const password = (form.querySelectorAll('input[type="password"]')[0] as HTMLInputElement)?.value;
    const password2 = (form.querySelectorAll('input[type="password"]')[1] as HTMLInputElement)?.value;
    const teacherCode = (form.querySelector('input[type="text"]') as HTMLInputElement)?.value;

    // Basic validation
    if (!role || !email || !password || !password2) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== password2) {
      alert("Passwords do not match.");
      return;
    }

    // Teacher code check
    if (role === "teacher") {
      const expected = process.env.NEXT_PUBLIC_TEACHER_CODE || process.env.TEACHER_CODE;
      if (!expected) {
        alert("Teacher code not configured in .env.local");
        return;
      }
      if (teacherCode.trim() !== expected.trim()) {
        alert("Invalid teacher code.");
        return;
      }
    }

    // Create user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, // store role in metadata
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Registration successful! Check your email for verification (if required).");
    router.push("/"); // go back to login page
    form.reset();
  };

  return (
    <div className="register-page">
      <h1 className="amv-title">AURORA MIND VERSE</h1>
      <p className="amv-subtitle">STEP INTO THE NEW ERA</p>

      <h2 className="register-heading">REGISTER</h2>

      <div className="form-card">
        <form onSubmit={onSubmit} className="register-grid">
          <select className="full" required defaultValue="">
            <option value="" disabled>
              Please select your role
            </option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <input className="full" type="email" placeholder="Email" required />

          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Re-type Password" required />

          <input type="text" placeholder="If teacher enter code here" />
          <button type="submit" className="primary-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
