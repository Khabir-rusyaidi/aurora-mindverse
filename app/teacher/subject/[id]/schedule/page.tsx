"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ---------------- helpers ---------------- */
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

/* ---------------- page ---------------- */
function SubjectSchedule({ subjectId }: { subjectId: string }) {
  const [userName, setUserName] = useState("USER");
  useEffect(() => { (async () => { const { data } = await supabase.auth.getUser(); setUserName(displayName(data?.user)); })(); }, []);

  const [monthCursor, setMonthCursor] = useState(() => new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2025, 0, 20));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [error, setError] = useState("");

  const monthName = monthCursor.toLocaleString(undefined, { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

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
          <div className="amv-pill"><span className="amv-dot" /><span>{userName}</span></div>
        </div>
      </div>

      {/* back arrow */}
      <div className="amv-back">
        <Link href="/teacher" className="amv-backbtn">←</Link>
      </div>

      {/* main two columns */}
      <div className="amv-grid">
        {/* calendar */}
        <div className="cal-card">
          <div className="cal-head">
            <button onClick={prevMonth} className="cal-arrow">←</button>
            <div className="cal-month">JANUARY</div>
            <div className="cal-year">2025</div>
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
              <span>  Loading…</span>
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

      {/* page-scoped CSS */}
      <style jsx>{`
        /* base */
        .amv-root{min-height:100vh;background:#7cc9f5;color:#000;font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial}
        /* top bar */
        .amv-topbar{background:#39a8f0;padding:14px 26px;display:flex;justify-content:space-between;align-items:center}
        .amv-brand{font-size:28px;font-weight:900;letter-spacing:.3px}
        .amv-tag{margin-top:-2px;font-size:12px;font-weight:700}
        .amv-right{display:flex;align-items:center;gap:22px}
        .amv-link{color:#3b3bbf;text-decoration:underline;font-weight:700}
        .amv-pill{background:#fff;border:1px solid rgba(0,0,0,.2);padding:6px 14px;border-radius:9999px;display:inline-flex;gap:10px;align-items:center;font-weight:900}
        .amv-dot{width:16px;height:16px;border-radius:9999px;background:#000;display:inline-block}

        /* back arrow */
        .amv-back{max-width:1160px;margin:6px auto 0;padding:0 20px}
        .amv-backbtn{display:inline-block;font-size:24px;font-weight:900;line-height:1;color:#000;text-decoration:none}

        /* main grid */
        .amv-grid{max-width:1160px;margin:8px auto 40px;padding:0 20px;display:grid;grid-template-columns:548px minmax(0,1fr);gap:26px}

        /* calendar card */
        .cal-card{background:#8fd2fb;border:2px solid #000;border-radius:28px;padding:18px 22px}
        .cal-head{display:grid;grid-template-columns:40px 1fr auto 40px;align-items:center;gap:8px;margin-bottom:8px}
        .cal-arrow{font-size:22px;font-weight:900;background:transparent;border:1px solid #000;border-radius:6px;width:36px;height:24px;line-height:20px;cursor:pointer}
        .cal-month{justify-self:center;font-size:22px;font-weight:900;letter-spacing:.5px}
        .cal-year{justify-self:start;font-size:22px;font-weight:900;margin-left:8px}
        .cal-days-labels{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:14px;opacity:.9;margin:4px 0 8px}
        .cal-grid{display:grid;grid-template-columns:repeat(7,76px);gap:18px;justify-content:center;padding:6px 0 8px}
        .day-btn{position:relative;width:76px;height:64px;border:3px solid #000;border-radius:16px;background:#fff;font-weight:800;box-shadow:0 1px 0 rgba(0,0,0,.15)}
        .day-btn>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px}
        .day-btn.sel::after{content:"";position:absolute;right:7px;bottom:6px;width:22px;height:22px;border:3px solid #2a8f32;background:#8cf493;border-radius:9999px}

        /* booking card */
        .book-card{background:#56b1f5;border:2px solid #000;border-radius:28px;padding:26px 28px}
        .book-title{font-size:38px;font-weight:900;text-align:center;margin:0 0 12px}
        .book-date{text-align:center;text-decoration:underline;text-underline-offset:3px;font-weight:900;margin-bottom:10px}
        .book-line{font-weight:900;text-align:center;white-space:pre-line}
        .book-label{letter-spacing:.3px}
        .book-list{white-space:pre-line;line-height:1.8;font-weight:700}
        .divider{height:3px;background:#000;margin:16px 0 12px}
        .book-sub{text-align:center;text-decoration:underline;font-weight:900;margin-bottom:16px}

        .err{color:#b91c1c;text-align:center;font-weight:900;margin-bottom:10px}

        .book-form{max-width:540px;margin:0 auto}
        .form-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px}
        .lab{font-weight:900;min-width:92px}
        .name-inp{width:360px;border:none;border-bottom:3px solid #000;outline:none;background:transparent;height:36px}
        .time-inp{border:2px solid #000;border-radius:10px;padding:8px 12px;height:40px}

        .save-row{display:flex;justify-content:flex-end;padding-right:6px}
        .save-btn{background:#2E59BA;color:#fff;border:none;border-radius:14px;padding:10px 26px;font-weight:900;cursor:pointer}
      `}</style>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <SubjectSchedule subjectId={params.id} />;
}
