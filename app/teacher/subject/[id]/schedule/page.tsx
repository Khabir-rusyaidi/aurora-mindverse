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

/* ---------- page ---------- */
function SubjectSchedule({ subjectId }: { subjectId: string }) {
  /* header user */
  const [userName, setUserName] = useState("USER");
  useEffect(() => { (async () => { const { data } = await supabase.auth.getUser(); setUserName(displayName(data?.user)); })(); }, []);

  /* ui state */
  const [monthCursor, setMonthCursor] = useState(() => new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2025, 0, 20));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [error, setError] = useState("");

  /* derived */
  const monthName = monthCursor.toLocaleString(undefined, { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

  /* data load per day */
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

  /* month nav */
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

  /* save */
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

  /* ---------- UI (pixel matched) ---------- */
  return (
    <div className="min-h-screen w-full" style={{ background: "#7cc9f5" }}>
      {/* top bar */}
      <div className="w-full" style={{ background: "#39a8f0" }}>
        <div className="max-w-[1160px] mx-auto py-4 px-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-wide">AURORA MIND VERSE</div>
            <div className="text-xs font-semibold -mt-1">STEP INTO THE NEW ERA</div>
          </div>
          <div className="flex items-center gap-8 text-sm font-semibold">
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-full font-bold shadow">
              <span className="inline-block w-5 h-5 rounded-full bg-black" />
              <span>{userName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* back arrow */}
      <div className="max-w-[1160px] mx-auto px-6 pt-3">
        <Link href="/teacher" className="inline-block text-2xl font-bold leading-none">←</Link>
      </div>

      {/* main grid */}
      <div className="max-w-[1160px] mx-auto px-6 pt-2 pb-10 grid grid-cols-1 md:grid-cols-[440px_minmax(0,1fr)] gap-10">
        {/* calendar card */}
        <div className="rounded-[28px] p-6 shadow" style={{ background: "#8fd2fb", border: "1px solid #000000" }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="text-2xl font-bold">←</button>
            <div className="flex items-center gap-3 text-lg font-extrabold tracking-wide">
              <span>{monthName}</span><span>{yearNum}</span>
            </div>
            <button onClick={nextMonth} className="text-2xl font-bold">→</button>
          </div>

          <div
            className="text-center text-sm opacity-80 mb-2"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div
            className="pt-1"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, 64px)", gap: "18px", justifyContent: "center" }}
          >
            {days.map((d) => {
              const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
              const isSelected = isoDateOnly(cellDate) === isoDateOnly(selectedDate);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(cellDate)}
                  className="h-16 w-16 rounded-2xl text-lg font-semibold relative"
                  style={{
                    border: "2px solid #000",
                    background: "#ffffff",
                    boxShadow: "0 0 0 3px rgb(0 0 0 / 18%) inset, 0 1px 2px rgb(0 0 0 / 15%)",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center">{d}</span>
                  {isSelected && (
                    <span
                      className="absolute right-1 bottom-1 w-7 h-7 rounded-full"
                      style={{ background: "#9bfb9f", border: "2px solid #2a8f32" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* booking card */}
        <div className="rounded-[28px] p-8 shadow" style={{ background: "#56b1f5", border: "1px solid #000000" }}>
          <h1 className="text-[34px] font-extrabold text-center mb-6 tracking-wide">BOOKING CLASS</h1>

          <div className="text-center">
            <div className="font-bold underline text-lg mb-2">{fmtLongUpper(selectedDate)}</div>
            <div className="font-bold">
              BOOKING :{" "}
              {loading ? (
                <span>Loading…</span>
              ) : bookings.length === 0 ? (
                <span className="italic">- NO BOOKING -</span>
              ) : (
                <div className="whitespace-pre-line leading-7">
                  {bookings
                    .map((b, i) => {
                      const s = new Date(b.start_at), e = new Date(b.end_at);
                      return `${i + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                    })
                    .join("\n")}
                </div>
              )}
            </div>
          </div>

          {/* thick divider */}
          <div className="mt-6 mb-6 h-[2px] w-full" style={{ background: "#000000" }} />

          <div className="text-center font-semibold underline mb-5">BOOKING</div>
          {error && <div className="text-red-700 text-sm text-center mb-3">{error}</div>}

          <form onSubmit={onSave} className="max-w-[520px] mx-auto space-y-6">
            <div className="flex items-center justify-center gap-4">
              <span className="font-semibold min-w-[86px]">NAME :</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-[300px] bg-transparent outline-none border-b-2 border-black py-1 text-center"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="font-semibold min-w-[86px]">TIME :</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step={60}
                className="border border-black rounded-lg px-3 py-1 text-sm"
              />
              <span>-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step={60}
                className="border border-black rounded-lg px-3 py-1 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="text-white font-extrabold px-10 py-2 rounded-xl"
                style={{ background: "#2E59BA" }}
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* default export (adjust param key if your folder name differs) */
export default function Page({ params }: { params: { id: string } }) {
  return <SubjectSchedule subjectId={params.id} />;
}
