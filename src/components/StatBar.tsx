'use client';

import React from 'react';

interface StatBarProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}

export default function StatBar({ icon, label, value, color, compact }: StatBarProps) {
  const isLow = value < 20;
  const isCritical = value < 10;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-2'}`}>
      <span className={`${compact ? 'text-sm' : 'text-lg'} ${isCritical ? 'animate-shake' : ''}`}>
        {icon}
      </span>
      {!compact && (
        <span className="text-xs text-gray-400 w-16 truncate">{label}</span>
      )}
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
        <div
          className={`h-full rounded-full bar-fill transition-all duration-300 ${isLow ? 'animate-pulse-slow' : ''}`}
          style={{
            width: `${Math.max(2, value)}%`,
            background: isCritical
              ? `linear-gradient(90deg, #FF4444, #FF0000)`
              : `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: isLow ? `0 0 8px ${color}66` : 'none',
          }}
        />
      </div>
      <span className={`text-xs font-mono w-8 text-right ${isCritical ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
        {Math.round(value)}
      </span>
    </div>
  );
}
