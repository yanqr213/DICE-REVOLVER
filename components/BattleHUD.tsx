
import React from 'react';
import { BossModifier, CyberwareDef, EnemyIntent } from '../types';
import { CoinIcon, ShieldIcon, CpuIcon, HeartIcon, SkullIcon, BugIcon, WifiOffIcon, LayersIcon, CrosshairIcon, SwordIcon, AlertOctagonIcon, ZapIcon, ShieldAlertIcon, ZapOffIcon } from './Icons';
import { CyberwareCard } from './CyberwareCard';
import { AlertTriangle } from 'lucide-react';

interface BattleHUDProps {
  level: number;
  gold: number;
  cyberware: CyberwareDef[];
  maxCyberwareSlots: number;
  
  playerHp: number;
  maxPlayerHp: number;
  playerShield: number;

  enemyHp: number;
  maxEnemyHp: number;
  enemyName: string;
  enemyIntent: EnemyIntent;
  bossModifier: BossModifier;
  isBoss: boolean;
}

// Intent Icon Helper
const IntentIcon = ({ intent }: { intent: EnemyIntent }) => {
    if (!intent) return null;

    let icon = <SwordIcon className="w-4 h-4 text-red-500" />;
    let colorClass = "border-red-500/30 bg-red-950/80 text-red-400";

    if (intent.type === 'PIERCING') {
        icon = <CrosshairIcon className="w-4 h-4 text-purple-400" />;
        colorClass = "border-purple-500/30 bg-purple-950/80 text-purple-300";
    } else if (intent.type === 'AOE_GLITCH') {
        icon = <BugIcon className="w-4 h-4 text-green-400" />;
        colorClass = "border-green-500/30 bg-green-950/80 text-green-300";
    } else if (intent.type === 'DESTROY_SLOT') {
        icon = <AlertOctagonIcon className="w-4 h-4 text-orange-500 animate-pulse" />;
        colorClass = "border-orange-500/30 bg-orange-950/80 text-orange-400";
    } else if (intent.type === 'COMBO') {
        icon = <LayersIcon className="w-4 h-4 text-yellow-400" />;
        colorClass = "border-yellow-500/30 bg-yellow-950/80 text-yellow-300";
    } else if (intent.type === 'JAM_WEAPON') {
        icon = <WifiOffIcon className="w-4 h-4 text-slate-400" />;
        colorClass = "border-slate-500/30 bg-slate-950/80 text-slate-300";
    }

    return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded border ${colorClass} shadow-sm min-w-[80px] justify-center transition-all duration-300`}>
            {icon}
            <div className="flex flex-col leading-none items-start">
                 <span className="font-mono font-bold text-xs">{intent.type === 'COMBO' ? `${intent.damage}x${intent.hits}` : intent.damage}</span>
                 <span className="text-[8px] uppercase opacity-70 whitespace-nowrap">{intent.desc}</span>
            </div>
        </div>
    );
};

export const BattleHUD: React.FC<BattleHUDProps> = (props) => {
    const { 
        level, gold, cyberware, maxCyberwareSlots, 
        playerHp, maxPlayerHp, playerShield,
        enemyHp, maxEnemyHp, enemyName, enemyIntent, bossModifier, isBoss 
    } = props;

    const playerHpPct = (playerHp / maxPlayerHp) * 100;
    const enemyHpPct = (enemyHp / maxEnemyHp) * 100;
    const playerShieldPct = Math.min(100, (playerShield / maxPlayerHp) * 100);

    // Colors
    const themeColor = isBoss ? 'red' : 'cyan';
    const barColorEnemy = isBoss ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-600' : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600';
    const barColorPlayer = playerHpPct < 30 ? 'bg-gradient-to-r from-red-900 to-red-600 animate-pulse' : 'bg-gradient-to-r from-emerald-600 to-emerald-400';

    return (
        <div className="w-full z-40 flex flex-col pointer-events-none">
            
            {/* 1. TOP INFO STRIP */}
            <div className="w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-3 py-1.5 sm:px-4 pointer-events-auto h-10 sm:h-12">
                {/* Left: Zone Info */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col leading-none">
                        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Location</span>
                        <div className={`font-black italic text-lg sm:text-xl tracking-tighter ${isBoss ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
                            ZONE {level} {isBoss && <span className="text-xs bg-red-600 text-black px-1 rounded ml-1 not-italic">BOSS</span>}
                        </div>
                    </div>
                    
                    {/* Gold */}
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-yellow-900/30">
                        <CoinIcon className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="font-mono font-bold text-yellow-400 text-sm">{gold}</span>
                    </div>
                </div>

                {/* Right: Cyberware */}
                <div className="flex items-center gap-1">
                     {cyberware.map((cw, i) => (
                        <div key={i} className="hidden sm:block"><CyberwareCard item={cw} compact /></div>
                    ))}
                     {/* Mobile Compact View for Cyberware could go here if needed, hiding for now to save space on strict mobile */}
                     <div className="flex sm:hidden gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                            <CpuIcon className="w-3 h-3" />
                            <span>{cyberware.length}/{maxCyberwareSlots}</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. BATTLE STATUS BAR */}
            <div className="w-full px-2 sm:px-4 py-2 flex items-stretch justify-between gap-2 sm:gap-6">
                
                {/* --- PLAYER STATS (Left) --- */}
                <div className="flex-1 flex flex-col justify-end max-w-[45%]">
                    <div className="flex justify-between items-end mb-1 pl-1">
                         <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">OPERATOR</span>
                         <div className="flex items-center gap-2">
                            {playerShield > 0 && (
                                <div className="flex items-center gap-0.5 text-blue-400 text-xs font-bold animate-pulse">
                                    <ShieldIcon className="w-3 h-3" /> {playerShield}
                                </div>
                            )}
                            <span className="font-mono font-bold text-sm text-emerald-400">{playerHp}/{maxPlayerHp}</span>
                         </div>
                    </div>
                    {/* Player Bar */}
                    <div className="h-2 sm:h-3 w-full bg-slate-900/80 rounded-sm relative overflow-hidden border border-slate-700 shadow-inner">
                        <div className={`h-full transition-all duration-500 ease-out ${barColorPlayer}`} style={{ width: `${playerHpPct}%` }} />
                        {playerShield > 0 && (
                            <div className="absolute top-0 left-0 h-full bg-blue-500/50 border-r border-blue-400 transition-all duration-300" style={{ width: `${playerHpPct + playerShieldPct}%` }}>
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.3)_2px,rgba(255,255,255,0.3)_4px)]"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- VS (Center) --- */}
                <div className="flex items-center justify-center pt-4">
                    <div className="text-slate-700 font-black italic text-xl opacity-50">VS</div>
                </div>

                {/* --- ENEMY STATS (Right) --- */}
                <div className="flex-1 flex flex-col justify-end max-w-[45%] relative">
                    
                    {/* Name & Intent Row */}
                    <div className="flex justify-between items-end mb-1 pr-1">
                         <div className="flex flex-col items-start">
                             <span className={`text-[10px] font-mono uppercase tracking-wider ${isBoss ? 'text-red-400' : 'text-cyan-400'}`}>Target</span>
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-sm sm:text-base text-white truncate max-w-[80px] sm:max-w-[120px]">{enemyName.replace('_', ' ')}</span>
                                {bossModifier.id !== 'NONE' && (
                                    <div className="flex items-center justify-center w-4 h-4 bg-red-500/20 rounded border border-red-500/50 text-red-500" title={bossModifier.desc}>
                                        {bossModifier.effectId === 'FIREWALL' && <ShieldAlertIcon className="w-3 h-3" />}
                                        {bossModifier.effectId === 'GLITCH' && <BugIcon className="w-3 h-3" />}
                                        {bossModifier.effectId === 'DAMPENER' && <ZapOffIcon className="w-3 h-3" />}
                                    </div>
                                )}
                             </div>
                         </div>
                         {/* Intent Bubble */}
                         <div className="mb-0.5 pointer-events-auto">
                             <IntentIcon intent={enemyIntent} />
                         </div>
                    </div>

                    {/* Enemy Bar */}
                    <div className={`h-3 sm:h-4 w-full bg-slate-900/80 rounded-sm relative overflow-hidden border ${isBoss ? 'border-red-900 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-cyan-900'} shadow-inner`}>
                        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#000_20px,#000_22px)] z-20"></div>
                        <div className={`h-full transition-all duration-300 ease-out ${barColorEnemy} relative z-10`} style={{ width: `${enemyHpPct}%` }}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                        </div>
                         {/* HP Text Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center z-30 text-[9px] font-mono font-bold text-white drop-shadow-md">
                            {enemyHp} / {maxEnemyHp}
                         </div>
                    </div>
                </div>

            </div>

            {/* Boss Warning Banner (If Boss) */}
            {isBoss && (
                 <div className="w-full bg-red-600/10 border-y border-red-600/30 text-red-500 text-[10px] font-mono uppercase tracking-[0.5em] text-center py-0.5 overflow-hidden">
                     <div className="animate-marquee whitespace-nowrap">
                        WARNING // HIGH THREAT DETECTED // SYSTEM INSTABILITY // BOSS ENCOUNTER // WARNING //
                     </div>
                 </div>
            )}
        </div>
    );
};
