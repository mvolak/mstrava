'use client';

// components/DateRangeSelector.tsx
import { useState } from 'react';

export default function DateRangeSelector({ 
  onRangeChange 
}: { 
  onRangeChange: (range: { start: Date; end: Date }) => void 
}) {
  const ranges = [
    { label: '3 months', months: 3 },
    { label: '6 months', months: 6 },
    { label: '12 months', months: 12 },
    { label: 'All time', months: null }
  ];

  const handleRangeSelect = (months: number | null) => {
    const end = new Date();
    const start = new Date();
    if (months) {
      start.setMonth(end.getMonth() - months);
    } else {
      // For "All time", go back 5 years or some reasonable default
      start.setFullYear(end.getFullYear() - 5);
    }
    onRangeChange({ start, end });
  };

  return (
    <div className="flex gap-2 mb-4">
      {ranges.map(({ label, months }) => (
        <button
          key={label}
          onClick={() => handleRangeSelect(months)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          {label}
        </button>
      ))}
    </div>
  );
}