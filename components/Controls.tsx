
import React from 'react';

interface ControlsProps {
  onRoll: () => void;
  onFire: () => void;
  rerolls: number;
  maxRerolls: number;
  isRolling: boolean;
  isFiring: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onRoll, onFire, rerolls, maxRerolls, isRolling, isFiring }) => {
  
  const canRoll = rerolls > 0 && !isRolling && !isFiring;

  return (
    <div className="w-full max-w-3xl mx-auto mt-2 px-2 select-none">
      
      <div className="flex gap-4 h-16 sm:h-20 items-stretch">
        
        {/* ROLL LEVER / BUTTON */}
        <div className="flex-1 relative group">
            <div className="absolute -top-1 left-2 right-2 h-1 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#facc15_5px,#facc15_10px)]"></div>

            <button
            onClick={onRoll}
            disabled={!canRoll}
            className={`
                w-full h-full relative overflow-hidden
                border-2 transition-all duration-100 active:scale-[0.98]
                flex flex-col items-center justify-center
                ${canRoll 
                ? 'bg-slate-800 border-slate-600 hover:border-yellow-400 hover:bg-slate-750' 
                : 'bg-black/60 border-slate-800 opacity-50 cursor-not-allowed'}
            `}
            style={{
                boxShadow: canRoll ? 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 0 #1e293b' : 'none',
                transform: canRoll ? 'translateY(0)' : 'translateY(4px)'
            }}
            >
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                
                <span className={`font-black text-xl tracking-[0.2em] ${canRoll ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-600'}`}>
                    重 掷
                </span>
                
                <div className="flex gap-1 mt-1">
                    {Array.from({ length: maxRerolls }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 w-5 skew-x-[-20deg] transition-colors duration-300 ${i < rerolls ? 'bg-yellow-400 shadow-[0_0_5px_#facc15]' : 'bg-slate-900 border border-slate-700'}`}
                        />
                    ))}
                </div>
            </button>
        </div>

        {/* FIRE SWITCH */}
        <div className="flex-[1.2] relative">
             <button
            onClick={onFire}
            disabled={isRolling || isFiring}
            className={`
                w-full h-full relative rounded-sm border-2 overflow-hidden
                transition-all duration-100 active:scale-[0.98] active:border-t-0
                ${isRolling || isFiring
                ? 'bg-slate-900 border-slate-800 grayscale cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-b from-pink-900 to-pink-950 border-pink-600 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]'}
            `}
            style={{
                boxShadow: !(isRolling || isFiring) ? '0 4px 0 #831843, inset 0 2px 5px rgba(255,255,255,0.2)' : 'none',
                transform: !(isRolling || isFiring) ? 'translateY(0)' : 'translateY(4px)'
            }}
            >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent opacity-50 animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="font-black text-3xl italic tracking-tighter text-white drop-shadow-md leading-none">
                    开 火
                </span>
                 <div className="text-[8px] text-pink-300 font-mono uppercase tracking-widest mt-1 border border-pink-500/30 px-2 py-0.5 rounded bg-black/40">
                    执 行
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#be185d_2px,#be185d_4px)] opacity-50"></div>
            </button>
        </div>

      </div>

    </div>
  );
};
