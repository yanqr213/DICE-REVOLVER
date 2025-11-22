
import React from 'react';

export type DieValue = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Empty/Spent

export interface DieData {
  id: number;
  value: DieValue;
  isLocked: boolean;
  isRolling: boolean;
}

export type GameStatus = 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY';
export type Difficulty = 'ROOKIE' | 'CYBERPSYCH';

export interface SessionStats {
  turnsTaken: number;
  maxDamageDealt: number;
  enemiesKilled: number;
}

export type WeaponType = 
  | 'REVOLVER' | 'SHOTGUN' | 'UZI' 
  | 'OMNI_BLASTER' 
  | 'LINEAR_RAIL'   
  | 'TACTICAL_EXEC'
  | 'GRENADE' | 'FLAMETHROWER' | 'RPG'
  | 'PLASMA' | 'VOID' | 'DOOMSDAY' | 'SHIV'
  | 'MIDAS_HAND' | 'CROSSBOW' | 'CHRONOS';

export interface CyberwareDef {
  id: string;
  name: string;
  desc: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'CORRUPTED';
  price: number;
  icon: React.ReactNode;
  onCalculate?: (context: ScoringContext) => Partial<ScoringContext>;
  onTurnStart?: (context: GameState) => Partial<GameState>;
}

export interface BossModifier {
  id: string;
  name: string;
  desc: string;
  effectId: 'NONE' | 'DAMPENER' | 'GLITCH' | 'FIREWALL';
}

export type EnemyActionType = 'ATTACK' | 'PIERCING' | 'AOE_GLITCH' | 'CHARGE' | 'DESTROY_SLOT' | 'COMBO' | 'JAM_WEAPON';

export interface EnemyIntent {
  type: EnemyActionType;
  damage: number;
  desc: string; 
  hits?: number;
}

export interface TacticalMission {
  desc: string;
  type: 'SUM_GT' | 'SUM_LT' | 'HAS_PAIR' | 'ALL_ODD' | 'ALL_EVEN' | 'NO_ONES' | 'HAS_SEQ'; 
  targetVal?: number;
  rewardMult: number;
}

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  highScore: number;
  stats: SessionStats;

  // Economy & Inventory
  gold: number;
  unlockedWeapons: WeaponType[];
  disabledWeapons: WeaponType[];
  cyberware: CyberwareDef[];
  maxCyberwareSlots: number;

  // Enemy
  hp: number;
  maxHp: number;
  level: number;
  enemyType: string; 
  bossModifier: BossModifier;
  enemyIntent: EnemyIntent;
  
  // Player
  playerHp: number;
  maxPlayerHp: number;
  playerShield: number; 
  lifesteal: number;
  rerolls: number;
  maxRerolls: number;
  
  // System
  dice: DieData[];
  maxDice: number;
  turn: number;
  tacticalMission?: TacticalMission;
}

export interface WeaponDef {
  id: WeaponType;
  name: string;
  req: string;
  baseChips: number;
  baseMult: number; 
  color: string;
  isArtifact?: boolean;
  description?: string;
}

export interface ScoringContext {
  chips: number;
  mult: number;
  diceSum: number;
  weaponId: WeaponType;
  diceValues: number[];
  level: number;
  turn: number;
}

export interface CombatResult {
  weapon: WeaponType;
  baseChips: number;
  baseMult: number;
  finalDamage: number;
  diceSum: number;
}

export interface DamagePopup {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
  isCrit: boolean;
  label?: string;
}

export interface Particle {
  id: string;
  x: string; 
  y: string;
  tx: string; 
  ty: string;
  color: string;
}

export type ShopItemType = 'CONSUMABLE' | 'CYBERWARE' | 'WEAPON';

export interface ShopItem {
  id: string;
  type: ShopItemType;
  name: string;
  desc: string;
  cost: number;
  icon: React.ReactNode;
  data?: any;
}

export type RewardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'CORRUPTED' | 'BOSS_SPECIAL';
export type RewardType = 'STAT_UP' | 'CYBERWARE' | 'WEAPON_UP' | 'MECHANIC' | 'ARTIFACT' | 'BOSS_ARTIFACT';

export interface RewardOption {
  id: string;
  title: string;
  desc: string;
  rarity: RewardRarity;
  type: RewardType;
  icon: React.ReactNode;
  apply: (state: GameState) => GameState;
}

export interface RewardModalProps {
  headerTitle?: string;
  options: RewardOption[];
  onSelect: (option: RewardOption) => void;
}
