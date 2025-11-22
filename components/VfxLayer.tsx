import React from 'react';
import { Particle } from '../types';

export const VfxLayer: React.FC<{ particles: Particle[] }> = ({ particles }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-fly"
          style={{
            left: p.x,
            top: p.y,
            width: '6px',
            height: '6px',
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            '--tx': p.tx,
            '--ty': p.ty,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};