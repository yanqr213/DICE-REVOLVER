import React from 'react';
import { CyberwareDef } from '../types';

interface CyberwareCardProps {
  item: CyberwareDef;
  compact?: boolean;
}

export const CyberwareCard: React.FC<CyberwareCardProps> = ({ item, compact = false }) => {
  const rarityColor: Record<string, string> = {
    'COMMON': 'border-slate-600 text-slate-300',
    'RARE': 'border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    'EPIC': 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    'LEGENDARY': 'border-fuchsia-500 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]',
  };

  if (compact) {
    return (
      <div className={`
        w-12 h-12 rounded bg-slate-900 border flex items-center justify-center relative group
        ${rarityColor[item.rarity] || rarityColor['COMMON']}
      `}>
          {item.icon}
          {/* Tooltip */}
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-black border border-slate-700 rounded text-[10px] pointer-events-none opacity-0 group-hover:opacity-100 z-50 transition-opacity">
              <div className="font-bold mb-1 text-white">{item.name}</div>
              <div className="text-slate-400">{item.desc}</div>
          </div>
      </div>
    );
  }

  return (
    <div className={`
        flex flex-col p-2 rounded border bg-slate-900/80 backdrop-blur-sm
        ${rarityColor[item.rarity] || rarityColor['COMMON']}
    `}>
       <div className="flex items-center gap-2 mb-1">
           <div className="w-6 h-6">{item.icon}</div>
           <span className="font-bold text-sm leading-none">{item.name}</span>
       </div>
       <span className="text-xs opacity-80">{item.desc}</span>
    </div>
  );
};