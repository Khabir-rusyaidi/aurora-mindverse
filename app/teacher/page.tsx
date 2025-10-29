"use client"; // <-- Add this line at the very top

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";

type UserMeta = { role?: "teacher" | "student" };

type Subject = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  artsteps_url: string | null;
  teacher_id: string;
};

type Booking = {
  id: string;
  subject_id: string;
  date: string;
  time: string;
  name: string;
};

/** Simple trash outline icon */
function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...props}>
      <path
        d="M3 6h18M9 6V4h6v2M7 6l1 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2L17 6M10 11v6M14 11v6"
        stroke="currentColor" strokeWidth={2} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const userName = useCurrentUser(); // 👈 shows FIRDAUS/TAY etc.
  const [showLogout, setShowLogout] = useState(false); // 👈 toggle dropdown
  const [showCalendar, setShowCalendar] = useState(false); // 👈 toggle calendar visibility
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null); // 👈 store selected subject for the calendar
  const [currentDate, setCurrentDate] = useState(new Date()); // 👈 current date for calendar
  const [bookings, setBookings] = useState<Booking[]>([]); // 👈 store bookings for the selected month
  const [subjects, setSubjects] = useState<Subject[]>([]); // 👈 store subjects
  const [loading, setLoading] = useState(true);
  
  // Handle logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  useEffect(() => {
    // Fetch current user and subjects
    (async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const u = userRes?.user;
      if (userErr || !u) { router.replace("/"); return; }

      const role = (u.user_metadata as UserMeta)?.role;
      if (role !== "teacher") { router.replace("/"); return; }

      const { data: rows, error } = await supabase
        .from("subjects")
        .select("id,title,description,image_url,artsteps_url,teacher_id")
        .order("created_at", { ascending: false });

      if (!error && rows) setSubjects(rows as Subject[]);
      setLoading(false);
    })();
  }, [router]);

  // Handle subject deletion
  const handleDelete = async (subject: Subject) => {
    if (!userName) return;
    const ok = window.confirm(`Delete "${subject.title}"? This cannot be undone.`);
    if (!ok) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subject.id)
      .eq("teacher_id", userName);

    if (error) {
      alert(error.message);
      return;
    }
    
    setSubjects(prev => prev.filter(s => s.id !== subject.id));
    alert("Subject deleted.");
  };

  // Load bookings for the current month
  const loadBookings = async () => {
    if (!selectedSubjectId) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("subject_id", selectedSubjectId)
      .gte("date", startOfMonth.toISOString().split('T')[0])
      .lte("date", endOfMonth.toISOString().split('T')[0]);

    if (error) {
      alert(error.message);
    } else {
      setBookings(data as Booking[]);
    }
  };

  useEffect(() => {
    if (showCalendar) loadBookings(); // Load bookings whenever calendar is shown
  }, [currentDate, showCalendar, selectedSubjectId]);

  // Change the month
  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Add a booking
  const handleBookingSubmit = async (date: string, time: string, name: string) => {
    if (!selectedSubjectId) return;

    const { error } = await supabase
      .from("bookings")
      .insert([{ subject_id: selectedSubjectId, date, time, name }]);

    if (error) {
      alert(error.message);
    } else {
      alert("Booking saved!");
      loadBookings(); // Refresh bookings after saving
    }
  };

  if (loading) {
    return (
      <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
        <div className="topbar">
          <div className="brand-block">
            <h1 className="amv-title">AURORA MIND VERSE</h1>
            <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
          </div>
          <div className="nav-right">
            <div className="nav-links"><Link href="/about">About Us</Link>&nbsp;&nbsp;<Link href="/contact">Contact</Link></div>
            <div className="profile-container">
              <button className="profile-pill"><span className="profile-icon">👤</span> {userName}</button>
            </div>
          </div>
        </div>
        <p className="welcome-text" style={{ marginTop: 24 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      {/* === SUBJECTS === */}
      <div style={{ width: "90%", margin: "18px auto 0 auto" }}>
        <h2 style={{ margin: "12px 0 16px 0" }}>My Subject</h2>
        {!subjects.length && (<p style={{ opacity: 0.8 }}>No subjects yet.</p>)}

        {subjects.map((s) => (
          <div key={s.id} className="subject-row" style={{ marginBottom: 16 }}>
            <div className="subject-thumb">
              {s.image_url ? <img src={s.image_url} alt={s.title} /> : "ADD PICTURE"}
            </div>

            <div className="subject-main">
              <h3>{s.title}</h3>
              <p style={{ opacity: 0.9 }}>{s.description}</p>
            </div>

            <div className="subject-actions">
              {s.teacher_id === userName ? (
                <>
                  <Link className="edit-link" href={`/teacher/subject/${s.id}/edit`}>
                    <span style={{ marginRight: 6 }}>✎</span> Edit
                  </Link>

                  <button
                    type="button"
                    className="delete-link"
                    onClick={() => handleDelete(s)}
                    aria-label={`Delete ${s.title}`}
                  >
                    <TrashIcon className="trash-svg" />
                    <span>Delete</span>
                  </button>
                  {/* Add Schedule button */}
                  <button
                    className="schedule-link"
                    onClick={() => handleScheduleClick(s.id)}
                  >
                    📅 Schedule
                  </button>
                </>
              ) : (
                <span style={{ opacity: 0.7, fontSize: 12 }}>by another teacher</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* === CALENDAR UI === */}
      {showCalendar && (
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>&lt;</button>
            <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => changeMonth(1)}>&gt;</button>
          </div>

          <div className="calendar-days">
            {Array.from({ length: 31 }, (_, day) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
              const dateString = date.toISOString().split('T')[0];
              const isBooked = bookings.some(b => b.date === dateString);

              return (
                <div
                  key={day}
                  className={`calendar-day ${isBooked ? 'booked' : ''}`}
                  onClick={() => loadBookings()}
                >
                  {day + 1}
                </div>
              );
            })}
          </div>

          {bookings.length > 0 && (
            <div className="booking-details">
              <h3>Bookings for {currentDate.toLocaleDateString()}</h3>
              <ul>
                {bookings.map((booking, index) => (
                  <li key={index}>
                    {booking.name} ({booking.time})
                  </li>
                ))}
              </ul>
              {/* Booking form */}
              <div>
                <input type="text" placeholder="Name" />
                <input type="time" />
                <button>Save</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
