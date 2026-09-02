'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BookingTrendChart({ data }: { data?: Array<{ day: string; bookings?: number }> }) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { day: 'Mon', bookings: 12 },
          { day: 'Tue', bookings: 16 },
          { day: 'Wed', bookings: 22 },
          { day: 'Thu', bookings: 18 },
          { day: 'Fri', bookings: 28 },
          { day: 'Sat', bookings: 25 },
          { day: 'Sun', bookings: 14 },
        ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderRadius: '0.75rem',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
