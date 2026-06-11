import React from 'react';
import logoUrl from '../../logo.png';

interface LogoProps {
  height?: number;
}

export default function Logo({ height = 44 }: LogoProps) {
  return (
    <img
      src={logoUrl}
      height={height}
      alt="Plymouth Crisis Connect"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
