
import React from 'react';
import { ShopItem, GameState } from '../types';
import { CoinIcon, ShopIcon } from './Icons';

interface ShopModalProps {
  items: ShopItem[];
  gold: number;
  onBuy: (item: ShopItem) => void;
  onNextLevel: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ items, gold, onBuy, onNextLevel }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="min-h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-3xl border-2 border-slate-800 bg-slate-900/80 rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <ShopIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white">CYBER_SHOP</h2>
                        <p className="text-xs font-mono text-cyan-600 uppercase tracking-[0.2em]">黑市连接已建立</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded border border-yellow-600/30">
                    <CoinIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-mono font-bold text-yellow-400">{gold}</span>
                </div>
            </div>

            {/* Items Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((item) => {
                    const canAfford = gold >= item.cost;
                    return (
                        <button
                            key={item.id}
                            onClick={() => canAfford && onBuy(item)}
                            disabled={!canAfford}
                            className={`
                                group relative flex flex-col p-4 rounded-lg border-2 transition-all duration-200 h-64
                                ${canAfford 
                                    ? 'bg-slate-800 border-slate-700 hover:border-cyan-400 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                                    : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed grayscale'}
                            `}
                        >
                            {/* Item Type Badge */}
                            <div className="absolute top-2 right-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/50 text-slate-400">
                                {item.type === 'CONSUMABLE' ? '消耗品' : item.type === 'WEAPON' ? '武器' : '义体'}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                                <div className={`p-3 rounded-full bg-slate-900 group-hover:scale-110 transition-transform duration-300 ${canAfford ? 'text-cyan-400' : 'text-slate-600'}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>

                            <div className={`mt-4 w-full py-2 rounded font-mono font-bold flex items-center justify-center gap-2 transition-colors
                                ${canAfford ? 'bg-slate-950 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black' : 'bg-slate-900 text-slate-600'}
                            `}>
                                <CoinIcon className="w-4 h-4" />
                                {item.cost}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button 
                    onClick={onNextLevel}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded hover:shadow-[0_0_20px_cyan] transition-all flex items-center gap-2"
                >
                    下一区域 <span>▶</span>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
