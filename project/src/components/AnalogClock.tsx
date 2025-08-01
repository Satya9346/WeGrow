import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours % 12) * 30 + (minutes / 60) * 30;
  const minuteDeg = (minutes * 6) + (seconds / 60) * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="flex flex-col items-center justify-center py-8 relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-green-100 rounded-3xl shadow-xl p-8">
      {/* Large Cloud-like shapes */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full opacity-50 blur-lg"></div>
      <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white rounded-full opacity-40 blur-lg"></div>
      <div className="absolute top-1/4 -right-16 w-40 h-40 bg-white rounded-full opacity-30 blur-lg"></div>
      <div className="absolute bottom-1/4 -left-16 w-36 h-36 bg-white rounded-full opacity-35 blur-lg"></div>

      {/* Simple Plant/Bush like shapes (left side) */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300 rounded-full opacity-60 blur-md translate-x-4 translate-y-4"></div>
      <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 rounded-full opacity-70 blur-md translate-x-4 translate-y-8"></div>

      {/* Simple Plant/Bush like shapes (right side) */}
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-green-300 rounded-full opacity-60 blur-md -translate-x-4 translate-y-4"></div>
      <div className="absolute bottom-0 right-12 w-22 h-22 bg-green-400 rounded-full opacity-70 blur-md -translate-x-4 translate-y-8"></div>

      {/* Small "Bird"-like shapes (abstract, minimal) */}
      <div className="absolute top-1/4 left-1/4 w-3 h-1 bg-gray-500 rounded-full -rotate-12 opacity-70"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-1 bg-gray-500 rounded-full rotate-12 opacity-60"></div>
      <div className="absolute top-1/2 left-1/3 w-2 h-1 bg-gray-500 rounded-full rotate-6 opacity-50"></div>

      <div className="relative w-64 h-64 border-4 border-gray-800 rounded-full shadow-xl bg-white flex justify-center items-center z-10">
        {/* Clock Center */}
        <div className="absolute w-4 h-4 bg-gray-800 rounded-full z-10"></div>

        {/* Digital Time Display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-lg font-bold text-gray-800 z-20">
          {format(time, 'hh:mm a')}
        </div>

        {/* Day/Date Display */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 translate-y-4 text-md font-medium text-gray-600 z-20 opacity-80 text-center">
          {format(time, 'EEEE, MMMM do, yyyy')}
        </div>

        {/* Hour Marks (simplified for a cleaner look) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-600"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-100px)`,
              width: '2px',
              height: '10px',
              transformOrigin: 'bottom center',
            }}
          ></div>
        ))}
        
        {/* Hour Hand */}
        <div
          className="absolute bg-gray-800 rounded-full"
          style={{
            width: '6px',
            height: '60px',
            transform: `rotate(${hourDeg}deg)`,
            transformOrigin: 'bottom center',
            bottom: '50%',
            left: 'calc(50% - 3px)'
          }}
        ></div>

        {/* Minute Hand */}
        <div
          className="absolute bg-gray-800 rounded-full"
          style={{
            width: '4px',
            height: '80px',
            transform: `rotate(${minuteDeg}deg)`,
            transformOrigin: 'bottom center',
            bottom: '50%',
            left: 'calc(50% - 2px)'
          }}
        ></div>

        {/* Second Hand */}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: '2px',
            height: '90px',
            transform: `rotate(${secondDeg}deg)`,
            transformOrigin: 'bottom center',
            bottom: '50%',
            left: 'calc(50% - 1px)'
          }}
        ></div>
      </div>
    </div>
  );
}