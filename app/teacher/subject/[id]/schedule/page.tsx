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
  const day = String(d.getDate());
  const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
function displayName(user: any | null) {
  if (!user) return "USER";
  const md = user.user_metadata || {};
  return (md.name || md.full_name || md.username || (user.email ? user.email.split("@")[0] : "USER"))
    .toString()
    .toUpperCase();
}

type Booking = { id: string; subject_id: string; name: string; start_at: string; end_at: string };

function SubjectSchedule({ subjectId }: { subjectId: string }) {
  const [userName, setUserName] = useState("USER");
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserName(displayName(data?.user));
    })();
  }, []);

  const [monthCursor, setMonthCursor] = useState(() => new Date(2025, 10, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2025, 10, 6));

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [error, setError] = useState("");

  const monthName = monthCursor.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

  async function loadDay() {
    if (!subjectId) return;
    setLoading(true);
    const dayStart = new Date(selectedDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate); dayEnd.setHours(23, 59, 59, 999);
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
  useEffect(() => { loadDay(); }, [subjectId, selectedDate]);

  function prevMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() - 1);
    setMonthCursor(d);
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), Math.min(selectedDate.getDate(), endOfMonth(d).getDate())));
  }
  function nextMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() + 1);
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
      {/* Back Arrow above header */}
      <div className="back-top">
        <Link href="/teacher" className="back-arrow">←</Link>
      </div>

      <div className="amv-topbar">
        <div>
          <div className="amv-brand">AURORA MIND VERSE</div>
          <div className="amv-tag">STEP INTO THE NEW ERA</div>
        </div>
        <div className="amv-right">
          <Link href="/about" className="toplink">About Us</Link>
          <Link href="/contact" className="toplink">Contact</Link>
          <div className="amv-pill">
            <svg className="avatar" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-3.866 3.134-6 8-6s8 2.134 8 6v1H4v-1z" />
            </svg>
            <span>{userName}</span>
          </div>
        </div>
      </div>

      {/* rest stays same */}
      <div className="gridwrap">
        <div className="cal-wrap">
          <div className="cal-card">
            <div className="cal-head">
              <button onClick={prevMonth} className="arrow">⬅</button>
              <div className="title">{monthName}</div>
              <div className="year">{yearNum}</div>
              <button onClick={nextMonth} className="arrow">➡</button>
            </div>
            <div className="days">
              {days.map((d) => {
                const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
                const isSelected = isoDateOnly(cellDate) === isoDateOnly(selectedDate);
                return (
                  <button key={d} onClick={() => setSelectedDate(cellDate)} className={"day" + (isSelected ? " sel" : "")}>
                    <span className="num">{d}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="book-card">
          <h1 className="book-title">BOOKING CLASS</h1>
          <div className="book-date">{fmtLongUpper(selectedDate)}</div>

          {!loading && (
            <div className="book-line">
              <span className="bld">BOOKING :</span>
              {bookings.length === 0 ? <span>{` - NO BOOKING -`}</span> :
                <span className="book-list">{bookings.map((b, i) => {
                  const s = new Date(b.start_at), e = new Date(b.end_at);
                  return `${i + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                }).join("   ")}</span>}
            </div>
          )}

          <div className="rule" />
          <div className="book-sub">BOOKING</div>
          {error && <div className="err">{error}</div>}

          <form onSubmit={onSave} className="book-form">
            <div className="row">
              <span className="lab">NAME :</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="name-line" />
            </div>
            <div className="row">
              <span className="lab">TIME :</span>
              <div className="time-field">
                <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="time-plain" />
                <span className="dash"> - </span>
                <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="time-plain" />
              </div>
            </div>
            <div className="save-row">
              <button type="submit" className="save">SAVE</button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
.amv-root{min-height:100vh;background:#7cc9f5;color:#000}
.back-top{background:#39a8f0;padding:8px 32px 0;}
.back-arrow{font-size:72px;font-weight:900;color:#000;text-decoration:none;cursor:pointer;line-height:1;}
.back-arrow:hover{transform:scale(0.95);}
.amv-topbar{background:#39a8f0;padding:0 32px 16px;display:flex;justify-content:space-between;align-items:center;}
.amv-brand{font-size:32px;font-weight:900}
.amv-tag{font-size:14px;font-weight:700}
.amv-right{display:flex;align-items:center;gap:24px}
.toplink{color:#000;text-decoration:none;font-weight:700}
.toplink:hover{text-decoration:underline}
.amv-pill{background:#fff;border:1px solid rgba(0,0,0,.25);padding:8px 16px;border-radius:9999px;display:flex;align-items:center;gap:10px;font-weight:900}
.avatar{width:18px;height:18px;color:#6b46c1;fill:currentColor}
.gridwrap{max-width:1120px;margin:10px auto 56px;padding:0 24px;display:grid;grid-template-columns:560px minmax(0,1fr);gap:36px;}
.cal-card{background:#fff;border-radius:28px;padding:26px 30px 32px}
.cal-head{display:grid;grid-template-columns:44px 1fr auto 44px;align-items:center}
.arrow{background:none;border:none;font-size:20px;font-weight:900;cursor:pointer}
.title{justify-self:center;font-size:28px;font-weight:900}
.year{justify-self:start;font-size:28px;font-weight:900;margin-left:10px}
.days{display:grid;grid-template-columns:repeat(7,55px);gap:10px;justify-content:center;margin-top:8px;}
.day{width:55px;height:48px;border:3px solid #000;border-radius:12px;display:flex;align-items:center;justify-content:center;}
.sel .num{background:#7eff85;border:3px solid #2a8f32;border-radius:8px;padding:2px 6px;}
.book-card{background:#4fb4f0;border-radius:28px;padding:28px;}
.book-title{font-size:42px;font-weight:900;text-align:center;margin-bottom:12px}
.book-date{text-align:center;text-decoration:underline;font-weight:900;margin-bottom:8px}
.book-line{font-weight:900;text-align:center;margin:6px 0 10px}
.rule{height:3px;background:#000;width:100%;margin:12px 0}
.book-sub{text-align:center;text-decoration:underline;font-weight:900;margin-bottom:18px}
.err{color:#b91c1c;text-align:center;font-weight:900;margin-bottom:10px}
.book-form{max-width:700px;margin:0 auto;padding-left:40px;}
.row{display:flex;align-items:center;gap:12px;margin-bottom:22px;}
.lab{font-weight:900;min-width:100px;text-align:left;}
.name-line{width:400px;border:none;border-bottom:4px solid #000;outline:none;background:transparent;height:34px;}
.time-field{display:flex;align-items:center;gap:8px;}
.time-plain{width:120px;font-weight:900;font-size:20px;text-align:center;}
.dash{font-weight:900;margin:0 2px;}
.save-row{display:flex;justify-content:flex-end;padding-right:40px;margin-top:8px;}
.save{background:#2E59BA;color:#fff;border:none;border-radius:16px;padding:12px 28px;font-weight:900;cursor:pointer;}
      `}</style>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <SubjectSchedule subjectId={params.id} />;
}
