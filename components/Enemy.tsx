
import React from 'react';
import { BossModifier, EnemyIntent } from '../types';

interface EnemyProps {
  hp: number; // Kept for visual states if needed (e.g. low HP color shift)
  maxHp: number;
  typeId: string;
  isHit: boolean;
  modifier: BossModifier;
  intent: EnemyIntent;
}

// --- BOSS VISUAL COMPONENTS (Keep SVGs as is) ---

const BossConstruct = () => (
  <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
    <defs>
      <linearGradient id="sentinelMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <radialGradient id="sentinelEye" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="40%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
         <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
         <feMerge>
             <feMergeNode in="coloredBlur"/>
             <feMergeNode in="SourceGraphic"/>
         </feMerge>
      </filter>
    </defs>

    <g transform="translate(150, 150)">
        <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
            <circle r="110" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="50 20" opacity="0.2" />
            <circle r="100" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="20 100" opacity="0.4" />
        </g>
        <g>
            <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="15s" repeatCount="indefinite" />
            <circle r="90" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="10 30" opacity="0.3" />
        </g>
        <path d="M-60,-80 L60,-80 L70,80 L-70,80 Z" fill="url(#sentinelMetal)" stroke="#334155" strokeWidth="2" />
        <path d="M-50,-70 L50,-70 L55,70 L-55,70 Z" fill="#0f172a" stroke="none" />
        
        <rect x="-40" y="-60" width="20" height="5" fill="#22d3ee" opacity="0.8" filter="url(#glowBlue)">
             <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="20" y="-60" width="20" height="5" fill="#22d3ee" opacity="0.5" />
        
        <rect x="-45" y="-30" width="90" height="2" fill="#1e293b" />
        <rect x="-45" y="0" width="90" height="2" fill="#1e293b" />
        <rect x="-45" y="30" width="90" height="2" fill="#1e293b" />

        <circle r="35" fill="#020617" stroke="#334155" strokeWidth="3" />
        <g>
             <circle r="15" fill="url(#sentinelEye)" filter="url(#glowBlue)">
                <animate attributeName="r" values="14;16;14" dur="3s" repeatCount="indefinite" />
             </circle>
             <rect x="-40" y="-2" width="80" height="4" fill="#22d3ee" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" values="0;180;360" dur="4s" repeatCount="indefinite" />
             </rect>
        </g>
        <g>
            <animate attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="4s" repeatCount="indefinite" />
            <path d="M-80,-20 L-65,-40 L-65,40 L-80,20 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
            <path d="M80,-20 L65,-40 L65,40 L80,20 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
        </g>
    </g>
  </svg>
);

const BossSpectre = () => (
  <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
    <defs>
        <filter id="noiseSpectre">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
        <linearGradient id="spectreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
    </defs>
    <g transform="translate(150, 140)">
        <path d="M-70,-80 Q0,-120 70,-80 Q100,0 70,80 L0,120 L-70,80 Q-100,0 -70,-80 Z" 
              fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5 5" opacity="0.3">
              <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite" />
        </path>
        <g filter="url(#noiseSpectre)">
            <path d="M-60,-70 C-90,-20 -80,50 -40,90 L0,110 L40,90 C80,50 90,-20 60,-70 C30,-110 -30,-110 -60,-70 Z" 
                  fill="url(#spectreGrad)" opacity="0.9" />
        </g>
        <g>
             <path d="M-40,-10 L-15,-10 L-27,15 Z" fill="#000" stroke="#ec4899" strokeWidth="2" />
             <circle cx="-27" cy="-5" r="3" fill="#fff">
                <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
             </circle>
             <path d="M40,-10 L15,-10 L27,15 Z" fill="#000" stroke="#ec4899" strokeWidth="2" />
             <circle cx="27" cy="-5" r="3" fill="#fff">
                <animate attributeName="opacity" values="1;0.2;1" dur="0.3s" repeatCount="indefinite" />
             </circle>
        </g>
        <path d="M0,20 L-8,40 L8,40 Z" fill="#000" />
        <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="6s" repeatCount="indefinite" />
             <path d="M-40,90 L-25,120 L25,120 L40,90 L30,70 L-30,70 Z" fill="#500724" stroke="#ec4899" strokeWidth="1" />
             <line x1="-20" y1="70" x2="-20" y2="90" stroke="#ec4899" strokeWidth="2" />
             <line x1="0" y1="70" x2="0" y2="90" stroke="#ec4899" strokeWidth="2" />
             <line x1="20" y1="70" x2="20" y2="90" stroke="#ec4899" strokeWidth="2" />
        </g>
        <rect x="-80" y="-20" width="160" height="2" fill="#fff" opacity="0.5">
            <animate attributeName="y" values="-50;150" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </rect>
    </g>
  </svg>
);

const BossAlgorithm = () => (
  <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
    <defs>
        <radialGradient id="coreGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="20%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#7e22ce" />
        </radialGradient>
    </defs>
    <g transform="translate(150, 150)">
        <g>
             <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
             <ellipse cx="0" cy="0" rx="100" ry="30" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
             <circle cx="100" cy="0" r="4" fill="#fff" />
        </g>
        <g>
             <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="15s" repeatCount="indefinite" />
             <ellipse cx="0" cy="0" rx="30" ry="100" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
             <circle cx="0" cy="-100" r="4" fill="#fff" />
        </g>
        <g>
             <animateTransform attributeName="transform" type="rotate" from="45" to="405" dur="20s" repeatCount="indefinite" />
             <ellipse cx="0" cy="0" rx="90" ry="90" fill="none" stroke="#d8b4fe" strokeWidth="0.5" strokeDasharray="10 10" opacity="0.3" />
        </g>
        <g>
            <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="2s" repeatCount="indefinite" />
            <path d="M-40,-40 L40,-40 L40,40 L-40,40 Z" fill="none" stroke="#fff" strokeWidth="2">
                 <animateTransform attributeName="transform" type="rotate" values="0;90;180;270;360" dur="12s" repeatCount="indefinite" />
            </path>
             <path d="M-40,-40 L40,-40 L40,40 L-40,40 Z" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.5">
                 <animateTransform attributeName="transform" type="rotate" values="45;135;225;315;405" dur="12s" repeatCount="indefinite" />
            </path>
            <circle r="30" fill="url(#coreGrad)" opacity="0.8">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
            </circle>
        </g>
        <line x1="0" y1="50" x2="0" y2="150" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.5">
            <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.5s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="-50" x2="0" y2="-150" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.5">
            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.5s" repeatCount="indefinite" />
        </line>
    </g>
  </svg>
);

const BossTitan = () => (
  <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,146,60,0.4)]">
     <defs>
         <linearGradient id="titanMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#431407" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#ea580c" />
         </linearGradient>
         <pattern id="hazard" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="10" fill="#000" />
            <rect x="5" width="5" height="10" fill="#fbbf24" />
         </pattern>
     </defs>
     <g transform="translate(150, 150)">
         <g>
             <rect x="-60" y="20" width="20" height="80" fill="#292524" />
             <rect x="40" y="20" width="20" height="80" fill="#292524" />
             <rect x="-55" y="25" width="10" height="40" fill="#78716c">
                 <animate attributeName="height" values="40;35;40" dur="1s" repeatCount="indefinite" />
             </rect>
              <rect x="45" y="25" width="10" height="40" fill="#78716c">
                 <animate attributeName="height" values="40;45;40" dur="1s" repeatCount="indefinite" />
             </rect>
         </g>
         <g>
             <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="2s" repeatCount="indefinite" />
             <path d="M-100,-60 L-40,-40 L-40,20 L-80,40 Z" fill="url(#titanMetal)" stroke="#000" />
             <path d="M100,-60 L40,-40 L40,20 L80,40 Z" fill="url(#titanMetal)" stroke="#000" />
             <rect x="-90" y="-50" width="20" height="10" fill="url(#hazard)" />
             <rect x="70" y="-50" width="20" height="10" fill="url(#hazard)" />
             <path d="M-50,-50 L50,-50 L40,50 L-40,50 Z" fill="#1c1917" stroke="#ea580c" strokeWidth="2" />
             <circle cx="0" cy="0" r="20" fill="#f97316">
                 <animate attributeName="fill" values="#f97316;#fff7ed;#f97316" dur="0.5s" repeatCount="indefinite" />
             </circle>
             <circle cx="0" cy="0" r="25" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="5 5">
                 <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
             </circle>
         </g>
         <g transform="translate(0, -60)">
             <rect x="-20" y="-20" width="40" height="30" fill="#431407" stroke="#ea580c" />
             <rect x="-15" y="-10" width="30" height="6" fill="#000" />
             <rect x="-5" y="-10" width="10" height="6" fill="red">
                 <animate attributeName="x" values="-15;5;-15" dur="1s" repeatCount="indefinite" />
             </rect>
         </g>
     </g>
  </svg>
);

const BossHydra = () => (
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_25px_rgba(132,204,22,0.4)]">
        <defs>
            <radialGradient id="slimeGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#bef264" />
                <stop offset="100%" stopColor="#3f6212" />
            </radialGradient>
        </defs>
        <g transform="translate(150, 160)">
            <path d="M0,50 Q-50,0 -60,-60 Q-70,-80 -90,-90" fill="none" stroke="#65a30d" strokeWidth="8" strokeLinecap="round">
                 <animate attributeName="d" values="M0,50 Q-50,0 -60,-60 Q-70,-80 -90,-90; M0,50 Q-40,10 -50,-50 Q-60,-70 -80,-100; M0,50 Q-50,0 -60,-60 Q-70,-80 -90,-90" dur="3s" repeatCount="indefinite" />
            </path>
            <circle cx="-90" cy="-90" r="10" fill="url(#slimeGrad)">
                <animate attributeName="cx" values="-90;-80;-90" dur="3s" repeatCount="indefinite" />
                <animate attributeName="cy" values="-90;-100;-90" dur="3s" repeatCount="indefinite" />
            </circle>
            <path d="M0,50 Q50,0 60,-60 Q70,-80 90,-90" fill="none" stroke="#65a30d" strokeWidth="8" strokeLinecap="round">
                 <animate attributeName="d" values="M0,50 Q50,0 60,-60 Q70,-80 90,-90; M0,50 Q40,10 50,-50 Q60,-70 80,-100; M0,50 Q50,0 60,-60 Q70,-80 90,-90" dur="2.5s" repeatCount="indefinite" />
            </path>
             <circle cx="90" cy="-90" r="10" fill="url(#slimeGrad)">
                <animate attributeName="cx" values="90;80;90" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="-90;-100;-90" dur="2.5s" repeatCount="indefinite" />
            </circle>
             <path d="M0,50 Q0,0 0,-80" fill="none" stroke="#65a30d" strokeWidth="12" strokeLinecap="round">
                 <animate attributeName="d" values="M0,50 Q-10,0 -10,-80; M0,50 Q10,0 10,-80; M0,50 Q-10,0 -10,-80" dur="4s" repeatCount="indefinite" />
            </path>
            <g>
                <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="4s" repeatCount="indefinite" />
                <circle cx="0" cy="-90" r="25" fill="url(#slimeGrad)" />
                <circle cx="0" cy="-90" r="30" fill="none" stroke="#bef264" strokeWidth="2" strokeDasharray="5 2" />
                <circle cx="-10" cy="-95" r="4" fill="black" />
                <circle cx="10" cy="-95" r="4" fill="black" />
                <circle cx="-10" cy="-95" r="1" fill="red" className="animate-ping" />
                <circle cx="10" cy="-95" r="1" fill="red" className="animate-ping" />
            </g>
            <ellipse cx="0" cy="50" rx="60" ry="20" fill="#3f6212" opacity="0.8">
                <animate attributeName="rx" values="60;65;60" dur="2s" repeatCount="indefinite" />
            </ellipse>
        </g>
    </svg>
);


const getBossVisual = (type: string) => {
    switch(type) {
        case 'BOSS_5': return <BossHydra />;
        case 'BOSS_4': return <BossTitan />;
        case 'BOSS_3': return <BossAlgorithm />;
        case 'BOSS_2': return <BossSpectre />;
        default: return <BossConstruct />;
    }
}

export const Enemy: React.FC<EnemyProps> = ({ hp, maxHp, typeId, isHit, modifier, intent }) => {
  const hpPercentage = (hp / maxHp) * 100;
  const isLowHp = hpPercentage < 30;
  
  return (
    <div className="w-full flex flex-col items-center justify-center relative z-10 h-56 sm:h-72">
      
      {/* Holographic Projector Base */}
      <div className="absolute bottom-0 w-64 h-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 to-transparent blur-xl transform rotateX(60deg)"></div>

      {/* Boss Container with Glitch Overlay */}
      <div className={`
          relative w-48 h-48 sm:w-64 sm:h-64 transition-all duration-150
          ${isHit ? 'brightness-200 scale-95 translate-x-2 filter-glitch' : ''}
          ${isLowHp ? 'opacity-80 mix-blend-hard-light' : 'opacity-100'}
      `}>
          {getBossVisual(typeId)}
          
          {/* Scanlines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
          
          {/* Random Glitch Slice Overlay */}
          <div className="absolute inset-0 bg-cyan-500/20 mix-blend-color-dodge animate-glitch-clip opacity-0 pointer-events-none group-hover:opacity-30"></div>
      </div>

    </div>
  );
};
