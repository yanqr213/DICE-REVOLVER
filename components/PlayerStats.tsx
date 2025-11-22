import React from 'react';
import { ShieldIcon } from './Icons';

interface PlayerStatsProps {
  hp: number;
  maxHp: number;
  shield?: number;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ hp, maxHp, shield = 0 }) => {
  const hpPercentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const shieldWidth = Math.min(100, (shield / maxHp) * 100); // Relative to Max HP for visual context
  
  // Color state
  const barColor = hpPercentage > 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : hpPercentage > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-800 animate-pulse';

  return (
    <div className="w-full max-w-md mx-auto px-4 mb-2">
      <div className="flex justify-between items-end mb-1 px-1">
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Integrity</span>
            {shield > 0 && (
                <div className="flex items-center gap-0.5 text-blue-400 text-[10px] font-bold animate-pulse">
                    <ShieldIcon className="w-3 h-3" />
                    <span>{shield}</span>
                </div>
            )}
        </div>
        <span className={`font-mono font-bold text-sm ${hpPercentage < 30 ? 'text-red-500' : 'text-cyan-300'}`}>
          {hp} / {maxHp}
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-slate-900/80 rounded-full overflow-hidden relative shadow-inner border border-white/5">
        {/* HP Bar */}
        <div 
          className={`h-full transition-all duration-500 ease-out ${barColor} shadow-[0_0_10px_currentColor] relative z-10`}
          style={{ width: `${hpPercentage}%` }}
        />
        
        {/* Shield Overlay - Blue bar on top of or extending the visual */}
        {shield > 0 && (
            <div 
                className="absolute top-0 left-0 h-full bg-blue-500/50 z-20 transition-all duration-300 border-r border-blue-300 shadow-[0_0_10px_#3b82f6]"
                style={{ width: `${Math.min(100, hpPercentage + shieldWidth)}%`, opacity: 0.7 }}
            >
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.3)_2px,rgba(255,255,255,0.3)_4px)]"></div>
            </div>
        )}
      </div>
    </div>
  );
};