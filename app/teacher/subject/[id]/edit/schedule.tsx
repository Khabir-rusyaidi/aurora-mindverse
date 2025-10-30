"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SchedulePage = ({ params }: { params: { subjectId: string } }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [booking, setBooking] = useState<{ name: string; time: string } | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // current month
  const [bookings, setBookings] = useState<{ name: string, time: string }[]>([]);
  
  const router = useRouter();

  // Load existing bookings (Simulated Data for now)
  useEffect(() => {
    // Simulate fetching from DB
    setBookings([
      { name: "Encik Firdaus", time: "13:00 - 14:00" },
      { name: "Encik Haziq", time: "15:30 - 16:00" }
    ]);
  }, []);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBooking({
      ...booking!,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBooking = () => {
    // Logic to save booking
    alert(`Booking saved for ${selectedDate} at ${booking?.time}`);
  };

  return (
    <div className="schedule-page">
      <h1>Schedule for {selectedDate || "Choose a Date"}</h1>
      
      {/* Calendar with month navigation */}
      <div className="calendar-navigation">
        <button onClick={() => setMonth(month - 1)}>&lt;</button>
        <h2>{`Month: ${month}`}</h2>
        <button onClick={() => setMonth(month + 1)}>&gt;</button>
      </div>

      <div className="calendar">
        {[...Array(31).keys()].map((day) => (
          <div
            key={day}
            className={`calendar-day ${selectedDate === (day + 1).toString() ? 'selected' : ''}`}
            onClick={() => setSelectedDate((day + 1).toString())}
          >
            {day + 1}
          </div>
        ))}
      </div>

      {/* Booking details */}
      {selectedDate && (
        <div className="booking-details">
          <h3>Booking Class</h3>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={booking?.name || ''}
            onChange={handleBookingChange}
            placeholder="Enter name"
          />
          <label>Time:</label>
          <input
            type="text"
            name="time"
            value={booking?.time || ''}
            onChange={handleBookingChange}
            placeholder="HH:mm - HH:mm"
          />
          <button onClick={handleSaveBooking}>Save</button>
        </div>
      )}

      {/* Show booked classes */}
      {selectedDate && (
        <div className="booking-info">
          <h3>Booking Information</h3>
          <div>
            {bookings.map((b, index) => (
              <p key={index}>{index + 1}) {b.name} ({b.time})</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
