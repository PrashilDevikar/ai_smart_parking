'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueBarChart({ data }: { data?: Array<{ day: string; revenue: number }> }) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { day: 'Mon', revenue: 145 },
          { day: 'Tue', revenue: 168 },
          { day: 'Wed', revenue: 194 },
          { day: 'Thu', revenue: 180 },
          { day: 'Fri', revenue: 230 },
          { day: 'Sat', revenue: 210 },
          { day: 'Sun', revenue: 135 },
        ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderRadius: '0.75rem',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
