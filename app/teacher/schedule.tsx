"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const BookingSchedule = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is a teacher, if not, redirect
  useEffect(() => {
    const fetchUser = async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const u = userRes?.user;
      if (userErr || !u) { router.replace("/"); return; }

      const userRole = (u.user_metadata as { role: string })?.role;
      setRole(userRole);

      if (userRole !== "teacher") {
        router.replace("/"); // Redirect to home if not a teacher
      }
    };
    fetchUser();
  }, [router]);

  const changeMonth = (direction: string) => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else if (direction === "next") {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const generateCalendar = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const calendar = [];
    for (let i = 0; i < startDay; i++) {
      calendar.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(i);
    }
    return calendar;
  };

  const getBookingForDate = (date: number) => {
    const booking = bookings.find(
      (b) => new Date(b.date).getDate() === date && new Date(b.date).getMonth() === currentMonth.getMonth()
    );
    return booking;
  };

  return (
    <div style={{ width: "95%", maxWidth: 1150, margin: "0 auto" }}>
      <div className="topbar">
        <div className="brand-block">
          <h1 className="amv-title">AURORA MIND VERSE</h1>
          <p className="amv-subtitle">STEP INTO THE NEW ERA</p>
        </div>
      </div>

      <div className="schedule-container">
        <div className="calendar-controls">
          <button onClick={() => changeMonth("prev")}>{"<"}</button>
          <h2>{currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}</h2>
          <button onClick={() => changeMonth("next")}>{">"}</button>
        </div>

        <div className="calendar-grid">
          {generateCalendar().map((day, index) => (
            <div key={index} className="calendar-day">
              {day && (
                <div className="day-cell">
                  <span>{day}</span>
                  {getBookingForDate(day) ? (
                    <p>Booking: {getBookingForDate(day)?.name} ({getBookingForDate(day)?.time})</p>
                  ) : (
                    <button onClick={() => alert(`Book for ${day}`)}>Book</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingSchedule;
