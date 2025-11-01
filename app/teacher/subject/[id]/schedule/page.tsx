"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ================= Helpers ================= */
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function daysInMonth(d: Date) {
  const end = endOfMonth(d).getDate();
  return Array.from({ length: end }, (_, i) => i + 1);
}
function isoDateOnly(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function withTime(date: Date, timeHHMM: string) {
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

/* =============== Inner Page =============== */
function SubjectScheduleInner({ subjectId }: { subjectId: string }) {
  // UI state
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date(2025, 0, 1)); // JAN 2025
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2025, 0, 20));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [name, setName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [error, setError] = useState<string>("");

  // Derived
  const monthName = monthCursor.toLocaleString(undefined, { month: "long" }).toUpperCase();
  const yearNum = monthCursor.getFullYear();
  const days = daysInMonth(monthCursor);

  // Load bookings for the selected day (subject-scoped)
  async function loadBookingsForSelectedDay() {
    if (!subjectId || !selectedDate) return;
    setLoading(true);
    setError("");

    const dayStart = new Date(selectedDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(selectedDate); dayEnd.setHours(23, 59, 59, 999);

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

  useEffect(() => {
    loadBookingsForSelectedDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, selectedDate]);

  // Actions
  function gotoPrevMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() - 1);
    setMonthCursor(d);
    const last = endOfMonth(d).getDate();
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), Math.min(selectedDate.getDate(), last)));
  }
  function gotoNextMonth() {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() + 1);
    setMonthCursor(d);
    const last = endOfMonth(d).getDate();
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), Math.min(selectedDate.getDate(), last)));
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

  /* =============== UI (matches your target) =============== */
  return (
    <div className="min-h-screen w-full" style={{ background: "#7cc9f5" }}>
      {/* Header */}
      <div className="w-full" style={{ background: "#39a8f0" }}>
        <div className="max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-wide">AURORA MIND VERSE</div>
            <div className="text-xs">STEP INTO THE NEW ERA</div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <div className="px-3 py-1 rounded-full shadow bg-white font-bold">FIRDAUS</div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-center items-start gap-12">
        {/* Calendar */}
        <div className="bg-[#7DC6F6] border border-black rounded-3xl p-6 shadow-lg w-[360px]">
          <div className="flex items-center justify-between mb-4">
            <button aria-label="Prev Month" onClick={gotoPrevMonth} className="text-2xl font-bold">←</button>
            <div className="font-bold text-lg">{monthName} {yearNum}</div>
            <button aria-label="Next Month" onClick={gotoNextMonth} className="text-2xl font-bold">→</button>
          </div>

          {/* Week header */}
          <div
            className="grid grid-cols-7 text-center text-sm opacity-80 mb-2"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          {/* Days */}
          <div
            className="grid grid-cols-7 gap-3 pt-1"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.75rem" }}
          >
            {days.map((d) => {
              const cellDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
              const isSelected = isoDateOnly(cellDate) === isoDateOnly(selectedDate);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`h-14 w-14 flex items-center justify-center rounded-2xl border border-black text-lg font-semibold ${isSelected ? "bg-[#9EE4F8]" : "bg-transparent"}`}
                  style={{ boxShadow: "0 0 0 3px rgb(0 0 0 / 20%) inset, 0 1px 3px rgb(0 0 0 / 20%)" }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking panel */}
        <div className="bg-[#56B1F5] border border-black rounded-3xl p-8 shadow-lg flex-1">
          <h1 className="text-3xl font-extrabold text-center mb-6 tracking-wide">BOOKING CLASS</h1>

          <div className="text-center mb-6">
            <div className="text-lg font-bold underline">{fmtLongUpper(selectedDate)}</div>
            <div className="font-semibold mt-2">
              BOOKING :
              {" "}
              {loading ? (
                <span>Loading…</span>
              ) : bookings.length === 0 ? (
                <span className="italic">- NO BOOKING -</span>
              ) : (
                <div className="whitespace-pre-line leading-7 mt-1">
                  {bookings
                    .map((b, idx) => {
                      const s = new Date(b.start_at);
                      const e = new Date(b.end_at);
                      return `${idx + 1}) ${b.name.toUpperCase()} (${fmt24(s)} - ${fmt24(e)})`;
                    })
                    .join("\n")}
                </div>
              )}
            </div>
          </div>

          <hr className="border-black mb-6" />

          <div className="text-center font-semibold underline mb-6">BOOKING</div>

          {error && <div className="text-red-700 text-sm mb-3 text-center">{error}</div>}

          <form onSubmit={onSave} className="space-y-6 text-base font-semibold max-w-md mx-auto">
            <div className="flex items-center justify-center gap-4">
              <label className="min-w-[80px]">NAME :</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b-2 border-black bg-transparent focus:outline-none w-56 text-center"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <label className="min-w-[80px]">TIME :</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step={60}
                className="border border-black rounded-lg p-1 text-sm"
              />
              <span> - </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step={60}
                className="border border-black rounded-lg p-1 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#2E59BA] text-white font-bold px-10 py-2 rounded-xl shadow-md hover:brightness-95"
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

/* ===== Default export (IMPORTANT: match your folder name) ===== */
// If your folder is [id]  -> keep this:
export default function Page({ params }: { params: { id: string } }) {
  return <SubjectScheduleInner subjectId={params.id} />;
}

/*
// If your folder is [subjectId] instead, use this version:
export default function Page({ params }: { params: { subjectId: string } }) {
  return <SubjectScheduleInner subjectId={params.subjectId} />;
}
*/
