import React from 'react';
import { DamagePopup } from '../types';

export const DamageFeedback: React.FC<{ items: DamagePopup[] }> = ({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute flex flex-col items-center whitespace-nowrap mix-blend-hard-light ${item.isCrit ? 'animate-burn-crit z-[60]' : 'animate-pop-impact z-50'}`}
          style={{
            left: `50%`, 
            top: `45%`, // Centered on screen mostly
            marginLeft: `${item.x}px`,
            marginTop: `${item.y}px`,
          }}
        >
          {/* Label Tag */}
          {item.label && (
              <span className={`
                text-[10px] sm:text-xs tracking-[0.2em] uppercase font-black px-2 py-0.5 mb-[-5px]
                border-2 shadow-lg
                ${item.isCrit 
                    ? 'bg-yellow-500 text-black border-white' 
                    : 'bg-slate-900 text-slate-400 border-slate-600'}
              `}>
                  {item.label}
              </span>
          )}

          {/* Main Number */}
          <div 
            className="font-black leading-none"
            style={{
                fontSize: item.isCrit ? '5rem' : '3.5rem', // Huge fonts
                color: item.isCrit ? '#fff' : '#fff',
                textShadow: item.isCrit 
                    ? `
                        4px 4px 0 #b91c1c, 
                        -2px -2px 0 #facc15,
                        0 0 20px #facc15,
                        0 0 40px #dc2626
                      `
                    : `
                        3px 3px 0 #000, 
                        -1px -1px 0 ${item.color},
                        0 0 15px ${item.color}
                      `,
                filter: item.isCrit ? 'drop-shadow(0 0 10px rgba(255,0,0,0.5))' : 'none'
            }}
          >
            {item.value}
          </div>
          
          {item.isCrit && <div className="text-xl font-black text-yellow-400 tracking-widest mt-[-10px] animate-pulse">CRITICAL</div>}
        </div>
      ))}
    </div>
  );
};