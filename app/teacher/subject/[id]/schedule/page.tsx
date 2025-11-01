"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ---------- helpers ---------- */
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function daysInMonth(d: Date) { return Array.from({ length: endOfMonth(d).getDate() }, (_, i) => i + 1); }
function isoDateOnly(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function withTime(date: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}
function fmt24(d: Date) { return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }
function fmtLongUpper(d: Date) {
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}
function displayName(user: any | null) {
  if (!user) return "USER";
  const md = user.user_metadata || {};
  return (md.name || md.full_name || md.username || (user.email ? user.email.split("@")[0] : "USER")).toString().toUpperCase();
}

type Booking = { id: string; subject_id: string; name: string; start_at: string; end_at: string; };

/* ---------- component ---------- */
function SubjectSchedule({ subjectId }: { subjectId: string }) {
  // header name
  const [userName, setUserName] = useState("USER");
  useEffect(() => { (async () => { const { data } = await supabase.auth.getUser(); setUserName(displayName(data?.user)); })(); }, []);

  // state
  const [monthCursor, setMonthCursor] = useState(() => new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2025, 0, 20));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [error, setError] = useState("");

  // derived
  const monthName = monthCursor.toLocaleString(undefined, { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

  // load day bookings
  async function loadDay() {
    if (!subjectId) return;
    setLoading(true);
    const dayStart = new Date(selectedDate); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(selectedDate);   dayEnd.setHours(23,59,59,999);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("subject_id", subjectId)
      .lte("start_at", dayEnd.toISOString())
      .gte("end_at", dayStart.toISOString())
      .order("start_at", { ascending: true });

    if (error) setError(error.message);
    setBookings(data ?? []);
    setLoading(false);
  }
  useEffect(() => { loadDay(); /* eslint-disable-next-line */ }, [subjectId, selectedDate]);

  // month nav
  function prevMonth() {
    const d = new Date(monthCursor); d.setMonth(d.getMonth() - 1);
    setMonthCursor(d);
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), Math.min(selectedDate.getDate(), endOfMonth(d).getDate())));
  }
  function nextMonth() {
    const d = new Date(monthCursor); d.setMonth(d.getMonth() + 1);
    setMonthCursor(d);
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), Math.min(selectedDate.getDate(), endOfMonth(d).getDate())));
  }

  // save
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter NAME."); return; }
    const s = withTime(selectedDate, startTime);
    const eTime = withTime(selectedDate, endTime);
    if (eTime <= s) { setError("End time must be after start time."); return; }
    const clash = bookings.some(b => {
      const bs = new Date(b.start_at).getTime();
      const be = new Date(b.end_at).getTime();
      return s.getTime() < be && eTime.getTime() > bs;
    });
    if (clash) { setError("Time overlaps an existing booking."); return; }

    const { error } = await supabase.from("bookings").insert({
      subject_id: subjectId, name: name.trim(),
      start_at: s.toISOString(), end_at: eTime.toISOString()
    });
    if (error) { setError(error.message); return; }
    setName(""); setStartTime("00:00"); setEndTime("00:00"); await loadDay();
  }

  return (
    <div className="amv-root">
      {/* top bar */}
      <div className="amv-topbar">
        <div>
          <div className="amv-brand">AURORA MIND VERSE</div>
          <div className="amv-tag">STEP INTO THE NEW ERA</div>
        </div>
        <div className="amv-right">
          <Link href="/about" className="amv-link">About Us</Link>
          <Link href="/contact" className="amv-link">Contact</Link>
          <div className="amv-pill">
            <span className="amv-dot" />
            <span>{userName}</span>
          </div>
        </div>
      </div>

      {/* back arrow */}
      <div className="amv-back">
        <Link href="/teacher" className="amv-backbtn">←</Link>
      </div>

      {/* main two-column layout */}
      <div className="amv-grid">
        {/* calendar */}
        <div className="cal-card">
          <div className="cal-head">
            <button onClick={prevMonth} className="cal-arrow">←</button>
            <div className="cal-month">{monthName}</div>
            <div className="cal-year">{yearNum}</div>
            <button onClick={nextMonth} className="cal-arrow">→</button>
          </div>

          <div className="cal-days-labels">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="cal-grid">
            {days.map((d) => {
              const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
              const isSelected = isoDateOnly(cellDate) === isoDateOnly(selectedDate);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(cellDate)}
                  className={"day-btn" + (isSelected ? " sel" : "")}
                  aria-label={`Day ${d}`}
                >
                  <span>{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* booking card */}
        <div className="book-card">
          <h1 className="book-title">BOOKING CLASS</h1>

          <div className="book-date">{fmtLongUpper(selectedDate)}</div>

          <div className="book-line">
            <span className="book-label">BOOKING :</span>
            {loading ? (
              <span> Loading…</span>
            ) : bookings.length === 0 ? (
              <span>  - NO BOOKING -</span>
            ) : (
              <div className="book-list">
                {bookings.map((b, i) => {
                  const s = new Date(b.start_at), e = new Date(b.end_at);
                  return `${i + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                }).join("\n")}
              </div>
            )}
          </div>

          <div className="divider" />

          <div className="book-sub">BOOKING</div>
          {error && <div className="err">{error}</div>}

          <form onSubmit={onSave} className="book-form">
            <div className="form-row">
              <span className="lab">NAME :</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="name-inp" />
            </div>

            <div className="form-row">
              <span className="lab">TIME :</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} step={60} className="time-inp" />
              <span> - </span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} step={60} className="time-inp" />
            </div>

            <div className="save-row">
              <button type="submit" className="save-btn">SAVE</button>
            </div>
          </form>
        </div>
      </div>

      {/* page-scoped CSS to pixel-match your mock */}
      <style jsx>{`
        /* background */
        .amv-root{min-height:100vh;background:#7cc9f5;color:#000}
        /* header */
        .amv-topbar{background:#39a8f0;padding:12px 24px;display:flex;justify-content:space-between;align-items:center}
        .amv-brand{font-size:24px;font-weight:900;letter-spacing:.2px}
        .amv-tag{margin-top:-2px;font-size:12px;font-weight:700}
        .amv-right{display:flex;align-items:center;gap:24px}
        .amv-link{color:#000;text-decoration:none;font-weight:700}
        .amv-link:hover{text-decoration:underline}
        .amv-pill{background:#fff;border:1px solid rgba(0,0,0,.15);padding:6px 12px;border-radius:9999px;display:inline-flex;gap:8px;align-items:center;font-weight:900}
        .amv-dot{width:18px;height:18px;border-radius:9999px;background:#000;display:inline-block}

        /* back */
        .amv-back{max-width:1160px;margin:8px auto 0;padding:0 24px}
        .amv-backbtn{display:inline-block;font-size:28px;font-weight:900;line-height:1;text-decoration:none;color:#000}

        /* grid */
        .amv-grid{max-width:1160px;margin:8px auto 40px;padding:0 24px;display:grid;grid-template-columns:440px minmax(0,1fr);gap:40px}

        /* calendar card */
        .cal-card{background:#8fd2fb;border:1px solid #000;border-radius:28px;padding:24px}
        .cal-head{display:grid;grid-template-columns:40px 1fr auto 40px;align-items:center;gap:10px;margin-bottom:10px}
        .cal-arrow{font-size:24px;font-weight:900;background:transparent;border:none;cursor:pointer}
        .cal-month{justify-self:center;font-size:20px;font-weight:900;letter-spacing:.5px}
        .cal-year{justify-self:start;font-size:20px;font-weight:900}
        .cal-days-labels{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:14px;opacity:.85;margin:8px 0 10px}
        .cal-grid{display:grid;grid-template-columns:repeat(7,64px);gap:18px;justify-content:center;padding-top:4px}
        .day-btn{position:relative;width:64px;height:64px;border:2px solid #000;border-radius:14px;background:#fff;font-weight:700}
        .day-btn>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
        .day-btn.sel::after{content:"";position:absolute;right:6px;bottom:6px;width:22px;height:22px;border:2px solid #2a8f32;background:#9bfb9f;border-radius:9999px}

        /* booking card */
        .book-card{background:#56b1f5;border:1px solid #000;border-radius:28px;padding:28px 32px}
        .book-title{font-size:34px;font-weight:900;text-align:center;margin:0 0 14px}
        .book-date{text-align:center;text-decoration:underline;font-weight:800;margin-bottom:6px}
        .book-line{font-weight:800;text-align:center;white-space:pre-line}
        .book-list{white-space:pre-line;line-height:1.8;font-weight:600}
        .divider{height:2px;background:#000;margin:18px 0}
        .book-sub{text-align:center;text-decoration:underline;font-weight:800;margin-bottom:14px}
        .err{color:#b91c1c;text-align:center;font-weight:800;margin-bottom:10px}

        .book-form{max-width:520px;margin:0 auto}
        .form-row{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px}
        .lab{font-weight:800;min-width:86px}
        .name-inp{width:320px;border:none;border-bottom:2px solid #000;outline:none;background:transparent;height:36px}
        .time-inp{border:1px solid #000;border-radius:10px;padding:6px 10px;height:36px}
        .save-row{display:flex;justify-content:flex-end}
        .save-btn{background:#2E59BA;color:#fff;border:none;border-radius:14px;padding:10px 28px;font-weight:900;cursor:pointer}
      `}</style>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <SubjectSchedule subjectId={params.id} />;
}
