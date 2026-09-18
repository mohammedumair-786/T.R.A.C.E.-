import React from 'react';

interface DataCalloutLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  className?: string;
  color?: string;
}

export const DataCalloutLine: React.FC<DataCalloutLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  className = '',
  color = '#00C2FF'
}) => {
  // Angled dogleg path: starts at (startX, startY), travels horizontally/vertically, then to (endX, endY)
  const midX = startX + (endX - startX) * 0.4;
  const pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

  return (
    <svg className={`pointer-events-none overflow-visible ${className}`}>
      <defs>
        <filter id="callout-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main connector path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 2"
        filter="url(#callout-glow)"
        opacity="0.85"
      />

      {/* Origin Ring */}
      <circle cx={startX} cy={startY} r="3" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={startX} cy={startY} r="1.5" fill={color} />

      {/* Destination Terminal Dot */}
      <circle cx={endX} cy={endY} r="2.5" fill={color} />
    </svg>
  );
};
