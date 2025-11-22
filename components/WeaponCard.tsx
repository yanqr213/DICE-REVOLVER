
import React, { useState } from 'react';
import { WeaponDef, WeaponType } from '../types';
import { 
  AimIcon, 
  DoomsdayIcon, FlamethrowerIcon, RpgIcon, PlasmaIcon, VoidIcon, 
  ShivIcon, GrenadeIcon, UziIcon, ShotgunIcon, RevolverIcon, 
  OmniBlasterIcon, LinearRailIcon, TacticalIcon, BiohazardIcon, LockIcon, CrossbowIcon
} from './Icons';

interface WeaponCardProps {
  weapon: WeaponDef;
  isActive?: boolean; 
  isFiring?: boolean;
  isDisabled?: boolean;
  level?: number;
}

const getWeaponIcon = (id: WeaponType) => {
    switch(id) {
        case 'OMNI_BLASTER': return <OmniBlasterIcon className="w-full h-full" />;
        case 'LINEAR_RAIL': return <LinearRailIcon className="w-full h-full" />;
        case 'TACTICAL_EXEC': return <TacticalIcon className="w-full h-full" />;
        case 'DOOMSDAY': return <DoomsdayIcon className="w-full h-full" />;
        case 'FLAMETHROWER': return <FlamethrowerIcon className="w-full h-full" />;
        case 'RPG': return <RpgIcon className="w-full h-full" />;
        case 'PLASMA': return <PlasmaIcon className="w-full h-full" />;
        case 'VOID': return <VoidIcon className="w-full h-full" />;
        case 'SHIV': return <ShivIcon className="w-full h-full" />;
        case 'GRENADE': return <GrenadeIcon className="w-full h-full" />;
        case 'UZI': return <UziIcon className="w-full h-full" />;
        case 'SHOTGUN': return <ShotgunIcon className="w-full h-full" />;
        case 'REVOLVER': return <RevolverIcon className="w-full h-full" />;
        case 'CROSSBOW': return <CrossbowIcon className="w-full h-full" />;
        case 'MIDAS_HAND': return <BiohazardIcon className="w-full h-full" />; 
        default: return <AimIcon className="w-full h-full" />;
    }
}

export const WeaponCard: React.FC<WeaponCardProps> = ({ weapon, isActive = false, isFiring = false, isDisabled = false, level = 1 }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic Multiplier Display
  const getMultDisplay = () => {
      if (weapon.id === 'OMNI_BLASTER') return '3xN';
      if (weapon.id === 'LINEAR_RAIL') return '5xL';
      return `x${weapon.baseMult}`;
  };

  const isTactical = weapon.id === 'TACTICAL_EXEC';

  return (
    <div 
        className={`
            relative flex flex-col flex-shrink-0 w-24 h-36 sm:w-28 sm:h-40
            transition-all duration-200 select-none
            ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : isActive ? 'translate-y-[-8px] z-20' : 'translate-y-0 opacity-80 hover:opacity-100'}
            ${isFiring ? 'animate-recoil-fire z-30' : ''}
        `}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
             if (isDisabled) return;
             e.stopPropagation();
             setIsHovered(!isHovered);
        }}
    >
      {/* Muzzle Flash Overlay */}
      {isFiring && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-radial-gradient from-yellow-200 to-transparent opacity-50 z-50 pointer-events-none animate-pulse mix-blend-screen"></div>
      )}

      {/* --- CARTRIDGE CASING --- */}
      <div 
        className={`
            w-full h-full relative rounded-t-lg rounded-b-sm overflow-hidden
            border-2 border-b-4
            flex flex-col
            ${isFiring ? 'bg-slate-800 border-yellow-200 shadow-[0_0_30px_#facc15]' : isActive ? 'bg-slate-900' : 'bg-slate-950'}
        `}
        style={{ 
            borderColor: isFiring ? '#fef08a' : (isActive && !isDisabled ? weapon.color : '#334155'),
            boxShadow: isFiring ? `0 0 50px ${weapon.color}` : (isActive && !isDisabled ? `0 0 20px ${weapon.color}40` : 'none')
        }}
      >
          
          {/* 1. Top Grip */}
          <div className={`h-5 w-full border-b border-slate-800 flex items-center justify-center gap-0.5 ${isActive ? 'bg-slate-800' : 'bg-slate-900'}`}>
              {[...Array(6)].map((_,i) => (
                  <div key={i} className="w-0.5 h-2.5 bg-slate-600 rounded-full"></div>
              ))}
              {isTactical && !isHovered && !isDisabled && (
                  <div className="absolute top-0 right-0 text-[8px] font-bold bg-green-500 text-black px-1 animate-pulse">任务</div>
              )}
          </div>

          {/* 2. Main Body */}
          <div className="flex-1 relative flex flex-col p-1">
                {/* Background Icon Faded */}
                <div className={`absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    <div className="w-20 h-20">
                        {getWeaponIcon(weapon.id)}
                    </div>
                </div>

                {/* DISABLED OVERLAY */}
                {isDisabled && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                        <LockIcon className="w-8 h-8 text-red-500 mb-1" />
                        <span className="text-[10px] font-black text-red-500 bg-black px-2 border border-red-500 rotate-[-15deg]">JAMMED</span>
                    </div>
                )}

                {/* TACTICAL OVERLAY (Hover or Click) */}
                {isTactical && isHovered && weapon.description && !isDisabled ? (
                    <div className="absolute inset-0 bg-slate-950/95 z-30 p-1.5 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-[8px] text-green-500 font-mono uppercase mb-1 border-b border-green-500/30 w-full pb-0.5">当前任务</div>
                        <div className="text-xs font-bold text-white leading-tight my-auto">{weapon.description}</div>
                        <div className="mt-auto text-[8px] text-slate-400 w-full border-t border-white/10 pt-1">点击隐藏</div>
                    </div>
                ) : null}

                {/* Weapon Name & Level */}
                <div className="flex justify-between items-start z-10 mb-1">
                    <span className="text-[10px] font-bold text-slate-300 leading-tight truncate w-16">{weapon.name}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v{level}</span>
                </div>

                {/* Center: THE MULTIPLIER */}
                <div className="flex-1 flex items-center justify-center z-10 relative">
                    <div 
                        className={`font-black italic tracking-tighter text-4xl drop-shadow-lg ${isFiring ? 'text-white scale-125' : 'text-transparent bg-clip-text'}`}
                        style={{ 
                            backgroundImage: isFiring ? 'none' : isDisabled ? 'linear-gradient(180deg, #555, #333)' : `linear-gradient(180deg, #fff, ${weapon.color})`,
                            textShadow: isActive && !isDisabled ? `0 0 15px ${weapon.color}` : 'none'
                        }}
                    >
                        <span className="text-xl align-top opacity-80 mr-0.5">{getMultDisplay().startsWith('x') ? '' : 'x'}</span>
                        {getMultDisplay().replace('x', '')}
                    </div>
                </div>

                {/* Requirements Text */}
                <div className="text-center z-10 mb-1 relative">
                    <div className="inline-block px-2 py-0.5 bg-black/60 rounded border border-white/10 backdrop-blur-md shadow-sm">
                        <span className={`text-[9px] font-mono font-bold tracking-tight ${isActive ? 'text-cyan-200' : 'text-slate-500'}`}>
                            {weapon.req}
                        </span>
                    </div>
                </div>
          </div>

          {/* 3. Bottom Stats Row */}
          <div className={`h-7 border-t border-white/10 flex items-center justify-between px-2 py-1 ${isActive ? 'bg-slate-900' : 'bg-black'}`}>
              <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isActive && !isDisabled ? 'animate-pulse bg-blue-400' : 'bg-slate-700'}`}></div>
                  <span className="text-xs font-bold font-mono text-blue-400">{weapon.baseChips}</span>
              </div>
              
              <div className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {getWeaponIcon(weapon.id)}
              </div>
          </div>
      </div>

      {/* Pins */}
      <div className="h-2 mx-1.5 flex gap-1 justify-center mt-[-1px] relative z-0">
          {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-3 h-2 rounded-b-sm border-b border-l border-r border-yellow-700 bg-gradient-to-b from-yellow-600 to-yellow-400 shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}></div>
          ))}
      </div>

      {/* Active Light */}
      {isActive && !isDisabled && (
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 blur-md rounded-full opacity-60"
            style={{ backgroundColor: weapon.color }}
          ></div>
      )}
    </div>
  );
};
