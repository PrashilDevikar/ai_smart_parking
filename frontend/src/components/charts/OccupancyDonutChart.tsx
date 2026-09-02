'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function OccupancyDonutChart({ data }: { data?: Array<{ name: string; value: number; color: string }> }) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { name: 'Available', value: 14, color: '#22C55E' },
          { name: 'Occupied', value: 7, color: '#EF4444' },
          { name: 'Reserved', value: 2, color: '#FACC15' },
          { name: 'Maintenance', value: 1, color: '#94A3B8' },
        ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderRadius: '0.75rem',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
