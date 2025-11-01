"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/** —— Helpers —— */
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function daysInMonth(d: Date) {
  const end = endOfMonth(d).getDate();
  return Array.from({ length: end }, (_, i) => i + 1);
}
function isoDateOnly(d: Date) {
  // YYYY-MM-DD (local)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function withTime(date: Date, timeHHMM: string) {
  // timeHHMM = "13:30"
  const [hh, mm] = timeHHMM.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}
function fmt24(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function fmtLongUpper(d: Date) {
  // "20 JANUARY 2025"
  return d
    .toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

type Booking = {
  id: string;
  subject_id: string;
  name: string;
  start_at: string; // ISO
  end_at: string;   // ISO
};

export default function SubjectSchedule() {
  const { id: subjectId } = useParams<{ id: string }>();

  /** —— State —— */
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    // default to January 2025 to match your screenshot look; replace with new Date() for "this month"
    return new Date(2025, 0, 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2025, 0, 20));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("00:00"); // 24h
  const [endTime, setEndTime] = useState<string>("00:00");     // 24h
  const [error, setError] = useState<string>("");

  /** —— Derived —— */
  const monthName = monthCursor.toLocaleString(undefined, { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

  /** —— Fetch bookings for the selected day —— */
  async function loadBookingsForSelectedDay() {
    if (!subjectId || !selectedDate) return;
    setLoading(true);
    setError("");

    // Query all bookings for this subject where the time window touches this selected day.
    const dayStart = new Date(selectedDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);   dayEnd.setHours(23, 59, 59, 999);

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

  useEffect(() => { loadBookingsForSelectedDay(); /* eslint-disable-next-line */ }, [subjectId, selectedDate]);

  /** —— Actions —— */
  function gotoPrevMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() - 1);
    setMonthCursor(d);
    // if selected day is out of new month, clamp to same day number or last day
    const last = endOfMonth(d).getDate();
    const sameDay = Math.min(selectedDate.getDate(), last);
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), sameDay));
  }
  function gotoNextMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() + 1);
    setMonthCursor(d);
    const last = endOfMonth(d).getDate();
    const sameDay = Math.min(selectedDate.getDate(), last);
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), sameDay));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter NAME."); return; }
    const s = withTime(selectedDate, startTime);
    const eTime = withTime(selectedDate, endTime);
    if (eTime <= s) { setError("End time must be after start time."); return; }

    // Prevent overlaps (client check)
    const clash = bookings.some(b => {
      const bs = new Date(b.start_at).getTime();
      const be = new Date(b.end_at).getTime();
      return s.getTime() < be && eTime.getTime() > bs; // overlap
    });
    if (clash) { setError("Time overlaps an existing booking."); return; }

    const { error } = await supabase.from("bookings").insert({
      subject_id: subjectId,
      name: name.trim(),
      start_at: s.toISOString(),
      end_at: eTime.toISOString()
    });

    if (error) { setError(error.message); return; }

    setName("");
    setStartTime("00:00");
    setEndTime("00:00");
    await loadBookingsForSelectedDay();
  }

  /** —— Styles for 100% look (match your screenshots) —— */
  return (
    <div className="min-h-screen w-full" style={{ background: "#7cc9f5" }}>
      {/* Header bar (matches your site tone) */}
      <div className="w-full" style={{ background: "#39a8f0" }}>
        <div className="max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-wide">AURORA MIND VERSE</div>
            <div className="text-xs">STEP INTO THE NEW ERA</div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <div className="px-3 py-1 rounded-full shadow bg-white flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-black" />
              <span>FIRDAUS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar card (left) */}
        <div className="bg-white/90 rounded-3xl p-6 shadow relative">
          {/* Back arrow */}
          <Link href="/teacher" className="absolute -top-8 left-0 text-2xl">&larr;</Link>

          {/* Month header with arrows */}
          <div className="flex items-center justify-between mb-3">
            <button
              aria-label="Prev Month"
              onClick={gotoPrevMonth}
              className="text-2xl leading-none"
            >
              &larr;
            </button>
            <div className="flex items-center gap-3">
              <div className="text-xl font-semibold">{monthName}</div>
              <div className="text-xl font-semibold">{yearNum}</div>
            </div>
            <button
              aria-label="Next Month"
              onClick={gotoNextMonth}
              className="text-2xl leading-none"
            >
              &rarr;
            </button>
          </div>

          {/* Weekdays row */}
          <div className="grid grid-cols-7 text-center text-sm opacity-80 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-3 pt-1">
            {days.map((d) => {
              const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
              const isSelected =
                isoDateOnly(cellDate) === isoDateOnly(selectedDate);

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(cellDate)}
                  className="h-14 rounded-2xl border border-black/60 relative"
                  style={{
                    boxShadow: "0 0 0 3px rgb(0 0 0 / 20%) inset, 0 1px 3px rgb(0 0 0 / 20%)"
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                    {d}
                  </span>

                  {/* green circle for selected day */}
                  {isSelected && (
                    <span
                      className="absolute right-1 bottom-1 w-6 h-6 rounded-full"
                      style={{ background: "#7eff85", border: "2px solid #2a8f32" }}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking panel (right) */}
        <div className="rounded-3xl p-8 shadow"
             style={{ background: "#4db4f0" }}>
          <h1 className="text-3xl font-extrabold text-center tracking-wide mb-6">
            BOOKING CLASS
          </h1>

          {/* Selected date */}
          <div className="text-center font-semibold underline mb-3">
            {fmtLongUpper(selectedDate)}
          </div>

          {/* Booking list */}
          <div className="text-lg mb-4">
            <span className="font-bold">BOOKING :</span>{" "}
            {loading ? (
              <span>Loading…</span>
            ) : bookings.length === 0 ? (
              <span className="italic">- NO BOOKING -</span>
            ) : (
              <div className="whitespace-pre-line leading-7">
                {bookings.map((b, idx) => {
                  const s = new Date(b.start_at);
                  const e = new Date(b.end_at);
                  return `${idx + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                }).join("\n")}
              </div>
            )}
          </div>

          <div className="border-t border-black my-4" />

          {/* Booking form */}
          <div className="text-center font-semibold underline mb-4">BOOKING</div>

          {error && <div className="text-red-700 text-sm mb-3">{error}</div>}

          <form onSubmit={onSave} className="grid gap-5 max-w-md">
            {/* NAME */}
            <label className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="justify-self-start font-semibold">NAME :</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b-2 border-black bg-transparent outline-none py-1"
                placeholder=""
              />
            </label>

            {/* TIME */}
            <label className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="justify-self-start font-semibold">TIME :</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  step={60}
                  className="border px-3 py-1 rounded-md"
                />
                <span>-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  step={60}
                  className="border px-3 py-1 rounded-md"
                />
              </div>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 rounded-xl text-white font-bold"
                style={{ background: "#3a57c8" }}
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
