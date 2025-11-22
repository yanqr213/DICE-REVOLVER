
import React from 'react';
import { Lock, Unlock, RotateCw, Skull, Crosshair, Coins, ShoppingBag, Plus, Zap, Heart, Shield, Sword, Bug, Cpu, Biohazard, Activity, Target, Fingerprint, Layers, WifiOff, AlertOctagon, ShieldAlert, ZapOff } from 'lucide-react';

// --- UI Icons (Lucide) ---
export const LockIcon = ({ className }: { className?: string }) => <Lock className={className} />;
export const UnlockIcon = ({ className }: { className?: string }) => <Unlock className={className} />;
export const ReloadIcon = ({ className }: { className?: string }) => <RotateCw className={className} />;
export const SkullIcon = ({ className }: { className?: string }) => <Skull className={className} />;
export const AimIcon = ({ className }: { className?: string }) => <Crosshair className={className} />;
export const CrosshairIcon = ({ className }: { className?: string }) => <Crosshair className={className} />;
export const CoinIcon = ({ className }: { className?: string }) => <Coins className={className} />;
export const ShopIcon = ({ className }: { className?: string }) => <ShoppingBag className={className} />;
export const PlusIcon = ({ className }: { className?: string }) => <Plus className={className} />;
export const ZapIcon = ({ className }: { className?: string }) => <Zap className={className} />;
export const HeartIcon = ({ className }: { className?: string }) => <Heart className={className} />;
export const ShieldIcon = ({ className }: { className?: string }) => <Shield className={className} />;
export const SwordIcon = ({ className }: { className?: string }) => <Sword className={className} />;
export const BugIcon = ({ className }: { className?: string }) => <Bug className={className} />;
export const CpuIcon = ({ className }: { className?: string }) => <Cpu className={className} />;
export const BiohazardIcon = ({ className }: { className?: string }) => <Biohazard className={className} />;
export const LayersIcon = ({ className }: { className?: string }) => <Layers className={className} />;
export const WifiOffIcon = ({ className }: { className?: string }) => <WifiOff className={className} />;
export const AlertOctagonIcon = ({ className }: { className?: string }) => <AlertOctagon className={className} />;
export const ShieldAlertIcon = ({ className }: { className?: string }) => <ShieldAlert className={className} />;
export const ZapOffIcon = ({ className }: { className?: string }) => <ZapOff className={className} />;

// --- WEAPON ICONS (Custom SVGs) ---

export const OmniBlasterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <circle cx="12" cy="12" r="8" strokeDasharray="2 4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="2" />
    <path d="M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" opacity="0.5" />
  </svg>
);

export const LinearRailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 12h20" strokeWidth="3" />
    <path d="M2 8l3-3 3 3M8 8l3-3 3 3M14 8l3-3 3 3" opacity="0.5" />
    <path d="M2 16l3 3 3-3M8 16l3 3 3-3M14 16l3 3 3-3" opacity="0.5" />
    <rect x="18" y="6" width="4" height="12" rx="1" fill="currentColor" />
  </svg>
);

export const TacticalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1" />
    <path d="M7 9h10M7 13h6M7 17h4" />
    <rect x="16" y="14" width="4" height="4" fill="currentColor" opacity="0.5" />
    <circle cx="12" cy="2" r="2" fill="currentColor" />
  </svg>
);

// Reused Icons
export const SingularityIcon = OmniBlasterIcon; 
export const PentaIcon = OmniBlasterIcon;
export const TorrentIcon = LinearRailIcon;
export const StrideIcon = LinearRailIcon;

export const QuantumIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-45 12 12)" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const DoomsdayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2l-6 9h12l-6-9z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 11v11" strokeWidth="3" />
    <path d="M8 22h8" />
    <path d="M12 2a10 10 0 0 1 8 8M4 10a10 10 0 0 1 8-8" strokeDasharray="2 2" />
  </svg>
);

export const FlamethrowerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 22c5.5 0 10-4 10-9 0-5-6-11-10-11S2 8 2 13c0 5 4.5 9 10 9z" />
    <path d="M12 10a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.1.9-2 2-2" />
    <path d="M12 16c-1.5 0-3-1-3-2.5" />
  </svg>
);

export const RpgIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M19 2l3 3-3 3" />
    <path d="M22 5H10l-8 8 4 4 8-8V5" />
    <path d="M13 8l-3 3" />
    <circle cx="6" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

export const PlasmaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeWidth="1.5" />
  </svg>
);

export const VoidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v8M12 13v8M3 12h8M13 12h8" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

export const ShivIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M6 21l2-8L22 2l-1 1-11 11-8 2z" fill="currentColor" fillOpacity="0.2" />
    <path d="M15 9l-2 2" />
    <line x1="2" y1="22" x2="6" y2="18" />
  </svg>
);

export const GrenadeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="8" y="6" width="8" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 2v4" strokeWidth="2" />
    <path d="M8 10h8M8 14h8" />
    <path d="M12 6v12" />
    <circle cx="15" cy="5" r="2" />
  </svg>
);

export const UziIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="4" y="8" width="12" height="6" rx="1" />
    <path d="M8 14v6h4v-6" fill="currentColor" fillOpacity="0.3" />
    <path d="M16 10h4v2h-4" />
    <line x1="7" y1="11" x2="11" y2="11" />
  </svg>
);

export const ShotgunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="7" width="18" height="4" rx="1" />
    <rect x="3" y="13" width="18" height="4" rx="1" />
    <path d="M2 7v10h3V7z" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

export const RevolverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="8" strokeWidth="2" />
    <circle cx="12" cy="7" r="2" />
    <circle cx="17" cy="12" r="2" />
    <circle cx="12" cy="17" r="2" />
    <circle cx="7" cy="12" r="2" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const CrossbowIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2v18" strokeWidth="2" />
    <path d="M5 7c0 0 3 5 7 5s7-5 7-5" />
    <path d="M5 17l7-5 7 5" />
    <line x1="5" y1="7" x2="5" y2="17" strokeWidth="1.5" />
    <line x1="19" y1="7" x2="19" y2="17" strokeWidth="1.5" />
    <circle cx="12" cy="20" r="2" fill="currentColor" />
  </svg>
);
