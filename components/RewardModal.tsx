
import React from 'react';
import { RewardOption } from '../types';

interface RewardModalProps {
  headerTitle?: string;
  options: RewardOption[];
  onSelect: (option: RewardOption) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ headerTitle, options, onSelect }) => {
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'LEGENDARY': return 'from-amber-900 via-yellow-900 to-amber-900 border-yellow-400 shadow-[0_0_40px_rgba(251,191,36,0.4)]';
      case 'EPIC': return 'from-fuchsia-900 to-purple-900 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)]';
      case 'RARE': return 'from-cyan-900 to-blue-900 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]';
      case 'CORRUPTED': return 'from-red-950 via-black to-red-900 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] border-dashed';
      default: return 'from-slate-800 to-slate-900 border-slate-600';
    }
  };

  const getRarityText = (rarity: string) => {
     switch(rarity) {
         case 'LEGENDARY': return 'LEGENDARY // 传说';
         case 'EPIC': return 'EPIC // 史诗';
         case 'RARE': return 'RARE // 稀有';
         case 'CORRUPTED': return 'CORRUPTED // 腐化';
         default: return 'COMMON // 普通';
     }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="min-h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col items-center my-auto">
            
            <h2 className="text-4xl md:text-6xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 italic tracking-tighter drop-shadow-[0_0_10px_cyan]">
            {headerTitle || '区域清理完成'}
            </h2>
            <p className="text-cyan-600 font-mono tracking-[0.5em] mb-8 text-sm uppercase">选择战术升级</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {options.map((option, idx) => (
                <button
                key={option.id}
                onClick={() => onSelect(option)}
                className={`
                    group relative h-96 rounded-xl border-2 p-6 flex flex-col items-center text-center transition-all duration-300
                    bg-gradient-to-br hover:scale-105 hover:-translate-y-2 overflow-hidden flex-shrink-0
                    ${getRarityColor(option.rarity)}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
                >
                {/* Background Noise/Effect */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {option.rarity === 'LEGENDARY' && (
                    <div className="absolute inset-0 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-yellow-500/20 opacity-50 animate-spin-slow pointer-events-none"></div>
                )}

                {option.rarity === 'CORRUPTED' && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.1)_10px,rgba(255,0,0,0.1)_20px)] pointer-events-none animate-pulse"></div>
                )}

                {/* Rarity Badge */}
                <div className={`
                    absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-b text-[10px] font-bold font-mono tracking-widest uppercase z-20
                    ${option.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : option.rarity === 'EPIC' ? 'bg-fuchsia-600 text-white' : option.rarity === 'RARE' ? 'bg-blue-500 text-white' : option.rarity === 'CORRUPTED' ? 'bg-red-600 text-black' : 'bg-slate-700 text-white'}
                `}>
                    {getRarityText(option.rarity)}
                </div>

                {/* Icon */}
                <div className={`
                    mt-8 mb-6 p-5 rounded-full bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner relative z-10
                    ${option.rarity === 'LEGENDARY' ? 'ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
                    ${option.rarity === 'CORRUPTED' ? 'ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.5)]' : ''}
                `}>
                    <div className={`${option.rarity === 'LEGENDARY' ? 'text-yellow-200' : option.rarity === 'EPIC' ? 'text-fuchsia-300' : option.rarity === 'RARE' ? 'text-blue-300' : option.rarity === 'CORRUPTED' ? 'text-red-500' : 'text-slate-300'} w-16 h-16`}>
                        {option.icon}
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-between w-full">
                    <div>
                        <h3 className={`text-2xl font-black mb-2 uppercase italic tracking-tight leading-none ${option.rarity === 'LEGENDARY' ? 'text-yellow-100' : option.rarity === 'CORRUPTED' ? 'text-red-200' : 'text-white'}`}>{option.title}</h3>
                        <div className="h-px w-12 bg-white/20 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-300 font-mono leading-relaxed">{option.desc}</p>
                    </div>

                    <div className={`
                        w-full py-3 rounded font-black text-sm uppercase tracking-widest mt-4 transition-colors
                        ${option.rarity === 'LEGENDARY' ? 'bg-yellow-500 group-hover:bg-yellow-400 text-black' : option.rarity === 'EPIC' ? 'bg-fuchsia-600 group-hover:bg-fuchsia-500 text-white' : option.rarity === 'RARE' ? 'bg-blue-600 group-hover:bg-blue-500 text-white' : option.rarity === 'CORRUPTED' ? 'bg-red-600 group-hover:bg-red-500 text-black' : 'bg-slate-700 group-hover:bg-slate-600 text-white'}
                    `}>
                        装 载
                    </div>
                </div>
                </button>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};
