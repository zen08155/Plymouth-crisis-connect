import React from 'react';

interface LogoProps {
  height?: number;
}

export default function Logo({ height = 44 }: LogoProps) {
  return (
    <svg
      height={height}
      viewBox="0 0 220 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Plymouth Emergency"
    >
      {/* ── Lighthouse tower ── */}
      <rect x="18" y="28" width="26" height="32" rx="2" fill="#2EC4B6"/>
      {/* Tower stripes */}
      <rect x="18" y="36" width="26" height="4" fill="#0B7285"/>
      <rect x="18" y="46" width="26" height="4" fill="#0B7285"/>
      {/* Tower top (roof) */}
      <polygon points="14,28 31,14 48,28" fill="#2EC4B6"/>
      {/* Lantern room window */}
      <rect x="24" y="17" width="14" height="10" rx="2" fill="#E6FFFA"/>
      {/* Person silhouette inside window */}
      <circle cx="31" cy="19.5" r="2.5" fill="#0B7285"/>
      <path d="M28 24 Q31 27 34 24" stroke="#0B7285" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Hose arm */}
      <path d="M34 21 Q40 19 42 22" stroke="#0B7285" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="42.5" cy="22.5" r="1.2" fill="#0B7285"/>
      {/* Tower base / platform */}
      <rect x="14" y="58" width="34" height="4" rx="1" fill="#2EC4B6"/>
      {/* Waves */}
      <path d="M6 66 Q12 62 18 66 Q24 70 30 66 Q36 62 42 66 Q48 70 54 66"
            stroke="#2EC4B6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M2 72 Q9 68 16 72 Q23 76 30 72 Q37 68 44 72 Q51 76 58 72"
            stroke="#2EC4B6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>

      {/* ── Text ── */}
      <text x="68" y="36" fontFamily="'Instrument Sans', sans-serif"
            fontWeight="800" fontSize="18" fill="#E6FFFA" letterSpacing="1">
        PLYMOUTH
      </text>
      <text x="68" y="56" fontFamily="'Instrument Sans', sans-serif"
            fontWeight="400" fontSize="16" fill="#2EC4B6" letterSpacing="0.5">
        Emergency
      </text>
    </svg>
  );
}
