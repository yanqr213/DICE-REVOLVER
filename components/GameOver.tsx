
import React from 'react';
import { SessionStats } from '../types';

interface GameOverProps {
  level: number;
  stats: SessionStats;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ level, stats, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="text-center p-1 w-full max-w-lg relative">
        
        {/* Glitchy Background Border */}
        <div className="absolute inset-0 border-t-2 border-b-2 border-red-600 opacity-50 animate-pulse pointer-events-none"></div>

        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-tighter mb-2 glitch-text" data-text="SYSTEM FAILURE">
          系统崩溃
        </h1>
        
        <div className="bg-slate-900/80 border border-red-900/50 p-6 mx-4 my-6 rounded shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <div className="text-2xl text-white font-mono mb-4 tracking-widest border-b border-red-900/30 pb-2">
              最终等级: {level}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-left font-mono text-sm text-slate-400">
                <div>
                    <div className="text-xs uppercase text-red-500/70">回合数</div>
                    <div className="text-xl text-white">{stats.turnsTaken}</div>
                </div>
                <div>
                    <div className="text-xs uppercase text-red-500/70">最大伤害</div>
                    <div className="text-xl text-white">{stats.maxDamageDealt}</div>
                </div>
                 <div>
                    <div className="text-xs uppercase text-red-500/70">击杀数</div>
                    <div className="text-xl text-white">{stats.enemiesKilled}</div>
                </div>
                 <div>
                    <div className="text-xs uppercase text-red-500/70">评价</div>
                    <div className="text-xl text-white">{level > 5 ? 'S级' : level > 3 ? 'B级' : 'D级'}</div>
                </div>
            </div>
        </div>
        
        <button
          onClick={onRestart}
          className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xl tracking-[0.2em] uppercase transition-all hover:scale-105 shadow-[0_0_25px_red] border border-red-400 clip-path-slope"
        >
          重启系统
        </button>
      </div>
    </div>
  );
};
