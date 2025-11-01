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

function SubjectSchedule({ subjectId }: { subjectId: string }) {
  /* top-right name */
  const [userName, setUserName] = useState("USER");
  useEffect(() => { (async () => { const { data } = await supabase.auth.getUser(); setUserName(displayName(data?.user)); })(); }, []);

  /* calendar + bookings */
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
  useEffect(() => { loadDay(); /* eslint-disable-line */ }, [subjectId, selectedDate]);

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
      subject_id: subjectId,
      name: name.trim(),
      start_at: s.toISOString(),
      end_at: eTime.toISOString()
    });
    if (error) { setError(error.message); return; }
    setName(""); setStartTime("00:00"); setEndTime("00:00"); await loadDay();
  }

  return (
    <div className="amv-root">
      {/* TOP BAR */}
      <div className="amv-topbar">
        <div>
          <div className="amv-brand">AURORA MIND VERSE</div>
          <div className="amv-tag">STEP INTO THE NEW ERA</div>
        </div>
        <div className="amv-right">
          <Link href="/about" className="toplink">About Us</Link>
          <Link href="/contact" className="toplink">Contact</Link>
          <div className="amv-pill"><span className="amv-dot" /><span>{userName}</span></div>
        </div>
      </div>

      {/* BACK ARROW */}
      <div className="amv-back">
        <Link href="/teacher" className="backbtn">←</Link>
      </div>

      {/* LAYOUT */}
      <div className="gridwrap">
        {/* CALENDAR */}
        <div className="cal-card">
          <div className="cal-head">
            <button onClick={prevMonth} className="arrow">⬅</button>
            <div className="title">{monthName}</div>
            <div className="year">{yearNum}</div>
            <button onClick={nextMonth} className="arrow">➡</button>
          </div>

          <div className="labels">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="days">
            {days.map((d) => {
              const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
              const isSelected = isoDateOnly(cellDate) === isoDateOnly(selectedDate);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(cellDate)}
                  className={"day" + (isSelected ? " sel" : "")}
                >
                  <span className="num">{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BOOKING PANEL */}
        <div className="book-card">
          <h1 className="book-title">BOOKING CLASS</h1>

          <div className="book-date">{fmtLongUpper(selectedDate)}</div>

          <div className="rule" />

          <div className="book-sub">BOOKING</div>
          {loading ? null : (
            <div className="book-line">
              <span className="bld">BOOKING : </span>
              {bookings.length === 0 ? <span> - NO BOOKING -</span> : null}
              {bookings.length > 0 && (
                <div className="book-list">
                  {bookings.map((b, i) => {
                    const s = new Date(b.start_at), e = new Date(b.end_at);
                    return `${i + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                  }).join("\n")}
                </div>
              )}
            </div>
          )}

          {error && <div className="err">{error}</div>}

          <form onSubmit={onSave} className="book-form">
            <div className="row">
              <span className="lab">NAME :</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="name-line" />
            </div>

            <div className="row time-row">
              <span className="lab">TIME :</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step={60}
                className="time-plain"
                aria-label="Start time"
              />
              <span className="dash"> - </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step={60}
                className="time-plain"
                aria-label="End time"
              />
            </div>

            <div className="save-row">
              <button type="submit" className="save">SAVE</button>
            </div>
          </form>
        </div>
      </div>

      {/* STYLES tuned to your image */}
      <style jsx>{`
        .amv-root{min-height:100vh;background:#7cc9f5;color:#000;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}
        .amv-topbar{background:#39a8f0;padding:16px 32px;display:flex;justify-content:space-between;align-items:center}
        .amv-brand{font-size:30px;font-weight:900}
        .amv-tag{margin-top:2px;font-size:13px;font-weight:700}
        .amv-right{display:flex;align-items:center;gap:24px}
        .toplink{color:#000;text-decoration:none;font-weight:700}
        .toplink:hover{text-decoration:underline}
        .amv-pill{background:#fff;border:1px solid rgba(0,0,0,.25);padding:8px 14px;border-radius:9999px;display:inline-flex;gap:8px;align-items:center;font-weight:900}
        .amv-dot{width:12px;height:12px;border-radius:9999px;background:#000;display:inline-block}

        .amv-back{max-width:1200px;margin:12px auto 0;padding:0 24px}
        .backbtn{font-size:28px;font-weight:900;color:#000;text-decoration:none}

        .gridwrap{max-width:1200px;margin:10px auto 56px;padding:0 24px;display:grid;grid-template-columns:520px minmax(0,1fr);gap:36px;align-items:stretch}

        /* CALENDAR */
        .cal-card{background:#9bd8fb;border-radius:34px;padding:18px 22px 26px;border:3px solid #000}
        .cal-head{display:grid;grid-template-columns:44px 1fr auto 44px;align-items:center}
        .arrow{background:none;border:none;font-size:20px;font-weight:900;cursor:pointer}
        .title{justify-self:center;font-size:28px;font-weight:900;letter-spacing:.6px}
        .year{justify-self:start;font-size:28px;font-weight:900;margin-left:10px}
        .labels{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:18px;margin:10px 0 12px}
        .days{display:grid;grid-template-columns:repeat(7,64px);gap:20px;justify-content:center}
        .day{width:64px;height:56px;border:4px solid #000;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center}
        .num{font-weight:900;font-size:22px;line-height:1}
        .sel .num{background:#7eff85;border:3px solid #2a8f32;border-radius:10px;padding:2px 8px}

        /* BOOKING CARD */
        .book-card{background:#4fb4f0;border-radius:28px;padding:28px;border:3px solid #000;display:flex;flex-direction:column}
        .book-title{font-size:42px;font-weight:900;text-align:center;margin:0 0 12px}
        .book-date{text-align:center;text-decoration:underline;text-underline-offset:4px;font-weight:900;margin-top:2px;margin-bottom:8px}
        .rule{height:3px;background:#000;width:640px;max-width:90%;margin:14px auto 10px}
        .book-sub{text-align:center;text-decoration:underline;font-weight:900;margin-bottom:18px}
        .book-line{font-weight:900;text-align:center;white-space:pre-line;margin-top:-6px;margin-bottom:8px}
        .err{color:#b91c1c;text-align:center;font-weight:900;margin-bottom:10px}

        .book-form{max-width:700px;margin:0 auto}
        .row{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:22px}
        .lab{font-weight:900;min-width:110px}
        .name-line{width:520px;border:none;border-bottom:4px solid #000;outline:none;background:transparent;height:34px}

        /* time look like plain text but editable */
        .time-row{gap:16px}
        .dash{font-weight:900}
        .time-plain{
          width:110px;
          border:none;background:transparent;outline:none;
          font: inherit;font-weight:900;font-size:20px;line-height:1.25;text-align:center;letter-spacing:.2px;padding:0;
          -webkit-appearance: none;appearance: textfield;
        }
        .time-plain::-webkit-calendar-picker-indicator{opacity:0;display:none}
        .time-plain::-webkit-clear-button{display:none}

        .save-row{display:flex;justify-content:flex-end;padding-right:24px;margin-top:2px}
        .save{background:#2E59BA;color:#fff;border:none;border-radius:16px;padding:12px 28px;font-weight:900;cursor:pointer}
      `}</style>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <SubjectSchedule subjectId={params.id} />;
}
