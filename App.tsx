
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Cpu, Eye, Zap, Shield, Heart, Swords, Crosshair, Database, TrendingUp, AlertTriangle, Anchor, BatteryCharging, Skull, Activity, Biohazard } from 'lucide-react';
import { DieData, DieValue, GameState, WeaponDef, CombatResult, DamagePopup, ShopItem, Difficulty, WeaponType, CyberwareDef, BossModifier, Particle, EnemyIntent, EnemyActionType, RewardOption, TacticalMission } from './types';
import { Die } from './components/Die';
import { Enemy } from './components/Enemy';
import { Controls } from './components/Controls';
import { WeaponCard } from './components/WeaponCard';
import { DamageFeedback } from './components/DamageFeedback';
import { ShopModal } from './components/ShopModal';
import { RewardModal } from './components/RewardModal';
import { GameOver } from './components/GameOver';
import { StartScreen } from './components/StartScreen';
import { VfxLayer } from './components/VfxLayer';
import { Background } from './components/Background';
import { BattleHUD } from './components/BattleHUD';
import { CoinIcon, PlusIcon, HeartIcon, AimIcon, ShieldIcon, SwordIcon, BiohazardIcon, CrossbowIcon, RevolverIcon, ShotgunIcon, UziIcon, GrenadeIcon } from './components/Icons';
import { soundManager } from './utils/audio';

const INITIAL_DICE_COUNT = 5;
const MAX_DICE_CAP = 10;
const MIN_DICE_CAP = 5; 
const MAX_REROLLS = 3;

// --- DATA DEFINITIONS ---

const WEAPONS: WeaponDef[] = [
  // ARTIFACTS (Special)
  { id: 'MIDAS_HAND', name: 'MIDAS·点金', req: '一对 (Pair)', baseChips: 0, baseMult: 5, color: '#fbbf24', isArtifact: true },
  { id: 'CROSSBOW', name: '诸葛连弩', req: '自动·每回合', baseChips: 0, baseMult: 20, color: '#84cc16', isArtifact: true }, 
  { id: 'CHRONOS', name: 'TIME·时之轮', req: '顺子 (Str)', baseChips: 0, baseMult: 1, color: '#2dd4bf', isArtifact: true, description: '再次结算本轮伤害' },

  // --- NEW CONSOLIDATED WEAPONS ---
  { id: 'OMNI_BLASTER', name: 'OMNI·聚变', req: 'X条 (3+)', baseChips: 80, baseMult: 3, color: '#ef4444' }, // Mult scales dynamically
  { id: 'LINEAR_RAIL', name: 'RAIL·洪流', req: '顺子 (3+)', baseChips: 60, baseMult: 2, color: '#0ea5e9' }, // Mult scales dynamically
  
  // TACTICAL WEAPON
  { id: 'TACTICAL_EXEC', name: 'TACTICAL·战术', req: '战术任务', baseChips: 50, baseMult: 10, color: '#10b981' },

  // FLAVOR / LOWER TIER
  { id: 'DOOMSDAY', name: '末日', req: '总和 >= 24', baseChips: 80, baseMult: 8, color: '#b91c1c' },
  { id: 'FLAMETHROWER', name: 'HELL·地狱火', req: '葫芦 (Full)', baseChips: 100, baseMult: 10, color: '#f97316' },
  { id: 'RPG', name: 'RPG', req: '葫芦', baseChips: 50, baseMult: 5, color: '#ea580c' },
  
  { id: 'PLASMA', name: '等离子', req: '全奇数', baseChips: 50, baseMult: 5, color: '#f59e0b' },
  { id: 'VOID', name: '虚空', req: '全偶数', baseChips: 50, baseMult: 5, color: '#6366f1' },
  { id: 'SHIV', name: '暗刃', req: '总和 <= 11', baseChips: 45, baseMult: 5, color: '#14b8a6' },
  
  { id: 'GRENADE', name: '手雷', req: '三条', baseChips: 30, baseMult: 3, color: '#eab308' }, // Flavor alt to Omni
  
  { id: 'UZI', name: '乌兹', req: '两对', baseChips: 20, baseMult: 3, color: '#ec4899' },
  { id: 'SHOTGUN', name: '霰弹枪', req: '一对', baseChips: 10, baseMult: 2, color: '#a855f7' },
  { id: 'REVOLVER', name: '左轮', req: '散牌', baseChips: 5, baseMult: 1, color: '#94a3b8' },
];

const CYBERWARE_POOL: CyberwareDef[] = [
    { 
        id: 'targeting_chip', name: '辅助瞄准芯片', desc: '霰弹枪触发时筹码+30', rarity: 'COMMON', price: 25, icon: <AimIcon />,
        onCalculate: (ctx) => ctx.weaponId === 'SHOTGUN' ? { chips: ctx.chips + 30 } : {}
    },
    {
        id: 'overclocker', name: '超频模组', desc: '若总和>20，倍率+4', rarity: 'RARE', price: 50, icon: <Cpu />,
        onCalculate: (ctx) => ctx.diceSum > 20 ? { mult: ctx.mult + 4 } : {}
    },
    {
        id: 'lucky_die', name: '黄金色子', desc: '30%概率倍率x1.5', rarity: 'LEGENDARY', price: 100, icon: <Zap />,
        onCalculate: (ctx) => Math.random() > 0.7 ? { mult: Math.floor(ctx.mult * 1.5) } : {}
    },
    // --- NEW WEAPON MECHANICS ---
    {
        id: 'mechanic_revolver', name: '弹巢: 午时已到', desc: '左轮机制修改: 倍率等于最大点数', rarity: 'RARE', price: 75, icon: <RevolverIcon />,
        onCalculate: (ctx) => ctx.weaponId === 'REVOLVER' ? { mult: Math.max(...ctx.diceValues, 1) } : {}
    },
    {
        id: 'mechanic_shotgun', name: '枪口: 独头弹', desc: '霰弹枪机制修改: 筹码增加点数总和x2', rarity: 'RARE', price: 75, icon: <ShotgunIcon />,
        onCalculate: (ctx) => ctx.weaponId === 'SHOTGUN' ? { chips: ctx.chips + (ctx.diceSum * 2) } : {}
    },
    {
        id: 'mechanic_uzi', name: '枪机: 双持模组', desc: '乌兹机制修改: 基础倍率翻倍', rarity: 'EPIC', price: 90, icon: <UziIcon />,
        onCalculate: (ctx) => ctx.weaponId === 'UZI' ? { mult: ctx.mult * 2 } : {}
    },
    {
        id: 'mechanic_grenade', name: '装药: 集束炸弹', desc: '手雷机制修改: 每一个额外的骰子倍率+2', rarity: 'EPIC', price: 90, icon: <GrenadeIcon />,
        onCalculate: (ctx) => ctx.weaponId === 'GRENADE' ? { mult: ctx.mult + (Math.max(0, ctx.diceValues.length - 3) * 2) } : {}
    }
];

// --- EVOLVING CORE CHIPS ---
const CHIP_POOL: CyberwareDef[] = [
    // --- COMMON (Linear Scaling) ---
    {
        id: 'core_stability', name: '核心: 稳定超频', desc: '每级增加 5 基础筹码 (按等级)', rarity: 'COMMON', price: 0, icon: <Activity className="w-full h-full text-slate-300" />,
        onCalculate: (ctx) => ({ chips: ctx.chips + (ctx.level * 5) })
    },
    {
        id: 'core_hull', name: '核心: 纳米镀层', desc: '每级增加 10 最大生命 (按等级)', rarity: 'COMMON', price: 0, icon: <Heart className="w-full h-full text-green-300" />,
        onTurnStart: (state) => ({ maxPlayerHp: state.maxPlayerHp + (state.level < 2 ? 10 : 5) }) // Initial boost then small scaling
    },
    {
        id: 'core_mining', name: '核心: 算力挖矿', desc: '每回合增加 3 金币 (固定)', rarity: 'COMMON', price: 0, icon: <Database className="w-full h-full text-yellow-300" />,
        onTurnStart: (state) => ({ gold: state.gold + 3 })
    },

    // --- RARE (Better Scaling or Economy) ---
    {
        id: 'core_learning', name: '算法: 深度学习', desc: '每级增加 20 筹码 (按等级)', rarity: 'RARE', price: 0, icon: <Database className="w-full h-full text-cyan-400" />,
        onCalculate: (ctx) => ({ chips: ctx.chips + (ctx.level * 20) })
    },
    {
        id: 'core_shield', name: '协议: 自动偏导', desc: '每回合开始获得 [等级x3] 的护盾', rarity: 'RARE', price: 0, icon: <Shield className="w-full h-full text-blue-400" />,
        onTurnStart: (state) => ({ playerShield: state.playerShield + (state.level * 3) })
    },
    {
        id: 'core_investment', name: '协议: 复利计算', desc: '每级增加 10% 金币获取', rarity: 'RARE', price: 0, icon: <TrendingUp className="w-full h-full text-yellow-400" />,
        onTurnStart: (state) => ({ gold: Math.floor(state.gold + (state.level * 2)) }) // Simplified for turn start
    },

    // --- LEGENDARY (Exponential/High Impact) ---
    {
        id: 'core_growth', name: '欧米茄: 过载生长', desc: '每5级增加 20% 最终倍率', rarity: 'LEGENDARY', price: 0, icon: <Cpu className="w-full h-full text-fuchsia-500" />,
        onCalculate: (ctx) => ({ mult: Math.floor(ctx.mult * (1 + (Math.floor(ctx.level / 5) * 0.2))) })
    },
    {
        id: 'core_vampire', name: '欧米茄: 血肉引擎', desc: '击杀回复 [等级x5] 生命值', rarity: 'LEGENDARY', price: 0, icon: <BiohazardIcon className="w-full h-full text-red-500" />,
        onTurnStart: (state) => ({}) // Logic handled in kill trigger mainly, but placeholder here
    },
    {
        id: 'core_quant_shield', name: '欧米茄: 事件视界', desc: '每回合开始重置护盾至 50% 最大生命值', rarity: 'LEGENDARY', price: 0, icon: <ShieldIcon className="w-full h-full text-purple-500" />,
        onTurnStart: (state) => ({ playerShield: Math.floor(state.maxPlayerHp * 0.5) })
    }
];

const BOSS_MODIFIERS: BossModifier[] = [
    { id: 'NONE', name: '', desc: '', effectId: 'NONE' },
    { id: 'WALL', name: '防火墙', desc: '点数1失效', effectId: 'FIREWALL' },
    { id: 'GLITCH', name: '系统故障', desc: '每手-10筹码', effectId: 'GLITCH' },
    { id: 'DAMPENER', name: '抑制器', desc: '基础倍率减半', effectId: 'DAMPENER' }
];

const getRandomFace = (): DieValue => Math.ceil(Math.random() * 6) as DieValue;

const getDistinctRandomFace = (current: DieValue): DieValue => {
    let next = getRandomFace();
    if (current !== 0) {
        while (next === current) {
            next = getRandomFace();
        }
    }
    return next;
};

const generateIntent = (level: number, enemyType: string): EnemyIntent => {
    const isBoss = level % 5 === 0;
    let baseDmg = 10 + Math.floor(level * 2.5);
    
    // Nerf levels 1-10
    if (level <= 10) {
        baseDmg = Math.floor(baseDmg * 0.7);
    }
    
    if (isBoss) {
        baseDmg = Math.floor(baseDmg * 1.5); 
        const rand = Math.random();
        if (rand < 0.25) return { type: 'COMBO', damage: Math.floor(baseDmg * 0.6), hits: 3, desc: '三连击' };
        if (rand < 0.45) return { type: 'JAM_WEAPON', damage: Math.floor(baseDmg * 0.8), desc: '武器干扰' };
        if (rand < 0.6) return { type: 'DESTROY_SLOT', damage: Math.floor(baseDmg * 1.2), desc: '槽位粉碎' };
        return { type: 'ATTACK', damage: baseDmg, desc: '强力重击' };
    }

    const rand = Math.random();
    if ((enemyType === 'BOSS_3' || level >= 5) && rand < 0.1) return { type: 'DESTROY_SLOT', damage: Math.floor(baseDmg * 1.2), desc: '槽位粉碎' };
    if (enemyType === 'BOSS_2' && rand > 0.5) return { type: 'PIERCING', damage: Math.floor(baseDmg * 0.8), desc: '穿甲攻击' };
    if (enemyType === 'BOSS_3' && rand > 0.5) return { type: 'AOE_GLITCH', damage: Math.floor(baseDmg * 0.6), desc: '骇入' };
    
    if (rand < 0.15) return { type: 'PIERCING', damage: Math.floor(baseDmg * 0.8), desc: '穿甲攻击' };
    if (rand < 0.3) return { type: 'AOE_GLITCH', damage: Math.floor(baseDmg * 0.6), desc: '骇入' };
    
    return { type: 'ATTACK', damage: baseDmg, desc: '攻击' };
};

const generateMission = (): TacticalMission => {
    const missions: TacticalMission[] = [
         { desc: '总和 > 22', type: 'SUM_GT', targetVal: 22, rewardMult: 2 },
         { desc: '总和 < 12', type: 'SUM_LT', targetVal: 12, rewardMult: 2 },
         { desc: '包含一对', type: 'HAS_PAIR', rewardMult: 1.5 },
         { desc: '全部为奇数', type: 'ALL_ODD', rewardMult: 3 },
         { desc: '全部为偶数', type: 'ALL_EVEN', rewardMult: 3 },
         { desc: '不包含1点', type: 'NO_ONES', rewardMult: 1.5 },
         { desc: '包含顺子(3+)', type: 'HAS_SEQ', rewardMult: 2.5 }
     ];
     return missions[Math.floor(Math.random() * missions.length)];
}

// --- RARITY PROBABILITY UTILS ---
const getChipRarityWeights = (level: number) => {
    if (level <= 3) return { COMMON: 0.70, RARE: 0.25, LEGENDARY: 0.05 };
    if (level <= 8) return { COMMON: 0.50, RARE: 0.40, LEGENDARY: 0.10 };
    if (level <= 15) return { COMMON: 0.30, RARE: 0.50, LEGENDARY: 0.20 };
    return { COMMON: 0.10, RARE: 0.50, LEGENDARY: 0.40 };
};

// --- LOCAL STORAGE HELPER ---
const getSavedHighScore = (): number => {
    try {
        const saved = localStorage.getItem('dice_revolver_highscore');
        return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
};

const saveHighScore = (score: number) => {
    try {
        const current = getSavedHighScore();
        if (score > current) {
            localStorage.setItem('dice_revolver_highscore', score.toString());
        }
    } catch (e) {}
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    difficulty: 'ROOKIE',
    highScore: 0, // Will init from effect
    stats: { turnsTaken: 0, maxDamageDealt: 0, enemiesKilled: 0 },
    gold: 0,
    unlockedWeapons: ['REVOLVER', 'SHOTGUN', 'GRENADE', 'UZI', 'OMNI_BLASTER', 'LINEAR_RAIL', 'TACTICAL_EXEC'], 
    disabledWeapons: [],
    cyberware: [],
    maxCyberwareSlots: 3,
    hp: 2000,
    maxHp: 2000,
    level: 1,
    enemyType: 'BOSS_1',
    bossModifier: BOSS_MODIFIERS[0],
    enemyIntent: { type: 'ATTACK', damage: 10, desc: '攻击' },
    playerHp: 200,
    maxPlayerHp: 200,
    playerShield: 0,
    lifesteal: 0,
    rerolls: MAX_REROLLS,
    maxRerolls: MAX_REROLLS,
    dice: [],
    maxDice: INITIAL_DICE_COUNT,
    turn: 1,
    tacticalMission: generateMission(),
  });

  const [rolling, setRolling] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'NORMAL' | 'HEAVY'>('NORMAL');
  const [firing, setFiring] = useState(false);
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponType | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showChipSelect, setShowChipSelect] = useState(false);
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  // Load high score on mount
  useEffect(() => {
      setGameState(prev => ({ ...prev, highScore: getSavedHighScore() }));
  }, []);

  // Save high score when level changes or game over
  useEffect(() => {
      if (gameState.level > gameState.highScore) {
          setGameState(prev => ({ ...prev, highScore: gameState.level }));
          saveHighScore(gameState.level);
      }
  }, [gameState.level]);

  useEffect(() => {
      if (gameState.dice.length !== gameState.maxDice) {
          setGameState(prev => {
              const current = prev.dice;
              if (prev.maxDice > current.length) {
                  const newDice = Array.from({ length: prev.maxDice - current.length }).map((_, i) => ({
                      id: Date.now() + i,
                      value: 0 as DieValue,
                      isLocked: false,
                      isRolling: false
                  }));
                  return { ...prev, dice: [...current, ...newDice] };
              } else {
                  return { ...prev, dice: current.slice(0, prev.maxDice) };
              }
          });
      }
  }, [gameState.maxDice, gameState.dice.length]);

  useEffect(() => {
      if(damagePopups.length > 0) {
          const timer = setTimeout(() => setDamagePopups(prev => prev.slice(1)), 2500); 
          return () => clearTimeout(timer);
      }
  }, [damagePopups]);

  useEffect(() => {
      if(particles.length > 0) {
          const timer = setTimeout(() => setParticles(prev => prev.slice(5)), 1000);
          return () => clearTimeout(timer);
      }
  }, [particles]);

  useEffect(() => {
      if(screenFlash) {
          const t = setTimeout(() => setScreenFlash(false), 100);
          return () => clearTimeout(t);
      }
  }, [screenFlash]);

  const generateChipOptions = (): RewardOption[] => {
      const weights = getChipRarityWeights(gameState.level);
      
      const getWeightedRarity = () => {
          const r = Math.random();
          if (r < weights.COMMON) return 'COMMON';
          if (r < weights.COMMON + weights.RARE) return 'RARE';
          return 'LEGENDARY';
      };

      const options: RewardOption[] = [];
      const selectedIds = new Set<string>();
      
      // Try to get 3 options
      for (let i = 0; i < 3; i++) {
          const targetRarity = getWeightedRarity();
          const pool = CHIP_POOL.filter(c => c.rarity === targetRarity && !selectedIds.has(c.id));
          
          // Fallback if pool exhausted for that rarity
          const fallbackPool = CHIP_POOL.filter(c => !selectedIds.has(c.id));
          const chip = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
          
          if (chip) {
              selectedIds.add(chip.id);
              options.push({
                  id: `chip_${chip.id}_${Date.now()}_${i}`,
                  title: chip.name,
                  desc: chip.desc,
                  rarity: chip.rarity as any,
                  type: 'CYBERWARE',
                  icon: chip.icon,
                  apply: (s) => ({ ...s, cyberware: [...s.cyberware, chip] })
              });
          }
      }
      return options;
  };

  const startPlayerTurn = (state: GameState): GameState => {
      let newState = { ...state, rerolls: state.maxRerolls };
      newState.cyberware.forEach(cw => {
          if (cw.onTurnStart) {
              newState = { ...newState, ...cw.onTurnStart(newState) };
          }
      });
      return newState;
  };

  const initGame = (difficulty: Difficulty) => {
    soundManager.startBgm('NORMAL');
    const startHp = difficulty === 'ROOKIE' ? 200 : 50;
    let initialEnemyHp = 2000;
    // Apply Level 1 nerf
    initialEnemyHp = Math.floor(initialEnemyHp * 0.7);

    let initialState: GameState = {
      status: 'PLAYING',
      difficulty,
      highScore: getSavedHighScore(),
      hp: initialEnemyHp,
      maxHp: initialEnemyHp,
      level: 1,
      gold: 0,
      cyberware: [],
      unlockedWeapons: ['REVOLVER', 'SHOTGUN', 'GRENADE', 'UZI', 'OMNI_BLASTER', 'LINEAR_RAIL', 'TACTICAL_EXEC'],
      disabledWeapons: [],
      playerHp: startHp,
      maxPlayerHp: startHp,
      playerShield: 0,
      lifesteal: 0,
      rerolls: MAX_REROLLS,
      maxRerolls: MAX_REROLLS,
      stats: { turnsTaken: 0, maxDamageDealt: 0, enemiesKilled: 0 },
      dice: Array.from({ length: INITIAL_DICE_COUNT }).map((_, i) => ({
        id: i, value: 0, isLocked: false, isRolling: false,
      })),
      maxDice: INITIAL_DICE_COUNT,
      bossModifier: BOSS_MODIFIERS[0],
      enemyIntent: generateIntent(1, 'BOSS_1'),
      turn: 1,
      enemyType: 'BOSS_1',
      tacticalMission: generateMission(),
      maxCyberwareSlots: 3
    };
    
    // Apply turn start effects immediately for the first turn
    // But we can't use startPlayerTurn easily here because we need to select chips first
    // We will defer this to handleSelectChip

    setGameState(initialState);

    // Start with Chip Selection
    setRewardOptions(generateChipOptions());
    setShowChipSelect(true);
  };

  const triggerShake = (intensity: 'NORMAL' | 'HEAVY' = 'NORMAL') => {
    setShakeIntensity(intensity);
    setShaking(false); 
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), intensity === 'HEAVY' ? 400 : 200);
  };

  const spawnParticles = (count: number, color: string, xBias: number = 0) => {
      const newParticles: Particle[] = [];
      for(let i=0; i<count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 200;
          newParticles.push({
              id: `p_${Date.now()}_${i}`,
              x: '50%', y: '40%',
              tx: `${Math.cos(angle) * dist + xBias}px`,
              ty: `${Math.sin(angle) * dist}px`,
              color: color
          });
      }
      setParticles(prev => [...prev, ...newParticles]);
  };

  const generateBossRewards = (): RewardOption[] => {
      return [
          { id: 'boss_augment', title: '欧米茄协议', desc: '所有武器等级 +1', rarity: 'BOSS_SPECIAL', type: 'BOSS_ARTIFACT', icon: <Zap className="w-full h-full text-fuchsia-400"/>, apply: (s) => ({ ...s }) },
          { id: 'boss_life', title: '泰坦合金', desc: '最大生命值 +100', rarity: 'BOSS_SPECIAL', type: 'STAT_UP', icon: <Heart className="w-full h-full text-red-400"/>, apply: (s) => ({ ...s, maxPlayerHp: s.maxPlayerHp + 100, playerHp: s.playerHp + 100 }) },
          { id: 'boss_reroll', title: '神经链路', desc: '最大重随次数 +2', rarity: 'BOSS_SPECIAL', type: 'STAT_UP', icon: <RefreshCw className="w-full h-full text-cyan-400"/>, apply: (s) => ({ ...s, maxRerolls: s.maxRerolls + 2 }) }
      ];
  }

  const generateRewards = (): RewardOption[] => {
      if (gameState.level % 5 === 0) {
          return generateBossRewards().map((o, i) => ({...o, id: `${o.id}_${Date.now()}_${i}`}));
      }

      const pool: RewardOption[] = [
          // COMMONS
          { id: 'hull', title: '装甲加固', desc: '最大生命 +20', rarity: 'COMMON', type: 'STAT_UP', icon: <Heart className="w-full h-full"/>, apply: (s) => ({ ...s, maxPlayerHp: s.maxPlayerHp + 20, playerHp: s.playerHp + 20 }) },
          { id: 'shield', title: '偏导力场', desc: '获得 30 护盾', rarity: 'COMMON', type: 'MECHANIC', icon: <Shield className="w-full h-full"/>, apply: (s) => ({ ...s, playerShield: s.playerShield + 30 }) },
          { id: 'gold', title: '加密缓存', desc: '获得 50 金币', rarity: 'COMMON', type: 'STAT_UP', icon: <Database className="w-full h-full"/>, apply: (s) => ({ ...s, gold: s.gold + 50 }) },
          { id: 'patch', title: '紧急修复', desc: '恢复 50 生命', rarity: 'COMMON', type: 'STAT_UP', icon: <BatteryCharging className="w-full h-full text-green-400"/>, apply: (s) => ({ ...s, playerHp: Math.min(s.maxPlayerHp, s.playerHp + 50) }) },
          
          // RARE
          { id: 'nanite_repair', title: '纳米修复群', desc: '恢复20%已损生命值', rarity: 'RARE', type: 'MECHANIC', icon: <Activity className="w-full h-full text-green-500"/>, apply: (s) => ({ ...s, playerHp: Math.floor(s.playerHp + (s.maxPlayerHp - s.playerHp) * 0.2) }) },
          { id: 'reroll', title: '义体手臂', desc: '最大重随次数 +1', rarity: 'RARE', type: 'STAT_UP', icon: <RefreshCw className="w-full h-full text-cyan-400"/>, apply: (s) => ({ ...s, maxRerolls: s.maxRerolls + 1 }) },
          
          // CORRUPTED
          { id: 'glass_cannon', title: '玻璃大炮', desc: '聚变倍率+2, 最大生命-40', rarity: 'CORRUPTED', type: 'STAT_UP', icon: <BiohazardIcon className="w-full h-full"/>, apply: (s) => ({ ...s, maxPlayerHp: Math.max(1, s.maxPlayerHp - 40), playerHp: Math.min(s.playerHp, Math.max(1, s.maxPlayerHp - 40)) }) },
          { id: 'blood_money', title: '血腥金钱', desc: '获得200金币, 当前生命-30', rarity: 'CORRUPTED', type: 'STAT_UP', icon: <Skull className="w-full h-full"/>, apply: (s) => ({ ...s, gold: s.gold + 200, playerHp: Math.max(1, s.playerHp - 30) }) },
          { id: 'heavy_plating', title: '重型板甲', desc: '最大生命+60, 重随次数-1', rarity: 'CORRUPTED', type: 'STAT_UP', icon: <Shield className="w-full h-full"/>, apply: (s) => ({ ...s, maxPlayerHp: s.maxPlayerHp + 60, playerHp: s.playerHp + 60, maxRerolls: Math.max(1, s.maxRerolls - 1) }) },
          { id: 'gamblers_ruin', title: '赌徒末路', desc: '色子槽位+2, 最大生命减半', rarity: 'CORRUPTED', type: 'STAT_UP', icon: <Cpu className="w-full h-full"/>, apply: (s) => ({ ...s, maxDice: Math.min(MAX_DICE_CAP, s.maxDice + 2), maxPlayerHp: Math.floor(s.maxPlayerHp * 0.5), playerHp: Math.min(s.playerHp, Math.floor(s.maxPlayerHp * 0.5)) }) },
          { id: 'overload', title: '系统过载', desc: '获得100护盾, 失去所有金币', rarity: 'CORRUPTED', type: 'STAT_UP', icon: <Zap className="w-full h-full"/>, apply: (s) => ({ ...s, playerShield: s.playerShield + 100, gold: 0 }) },
          { id: 'corrupt_data', title: '数据损坏', desc: '色子槽位+1, 每回合随机锁定1个色子', rarity: 'CORRUPTED', type: 'MECHANIC', icon: <AlertTriangle className="w-full h-full"/>, apply: (s) => ({ ...s, maxDice: Math.min(MAX_DICE_CAP, s.maxDice + 1) }) },
          { id: 'scavenger', title: '拾荒协议', desc: '击杀回血+10, 最大生命-10', rarity: 'CORRUPTED', type: 'MECHANIC', icon: <Activity className="w-full h-full"/>, apply: (s) => ({ ...s, maxPlayerHp: s.maxPlayerHp - 10 }) },
          { id: 'unstable_core', title: '不稳定核心', desc: '吸血+50%, 每次开火自损5点', rarity: 'CORRUPTED', type: 'MECHANIC', icon: <BiohazardIcon className="w-full h-full"/>, apply: (s) => ({ ...s, lifesteal: s.lifesteal + 0.5 }) },
          
          // LEGENDARY
          { id: 'ram_expansion', title: '内存扩展', desc: '色子槽位 +1 (Max 10)', rarity: 'LEGENDARY', type: 'STAT_UP', icon: <Cpu className="w-full h-full text-fuchsia-400"/>, apply: (s) => ({ ...s, maxDice: Math.min(MAX_DICE_CAP, s.maxDice + 1) }) },
      ];

      if (!gameState.unlockedWeapons.includes('MIDAS_HAND')) {
          pool.push({ id: 'artifact_midas', title: '遗物: 迈达斯之手', desc: '特效: 伤害随持有金币增加', rarity: 'LEGENDARY', type: 'ARTIFACT', icon: <CoinIcon className="w-full h-full text-yellow-300"/>, apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'MIDAS_HAND'] }) });
      }
      if (!gameState.unlockedWeapons.includes('CROSSBOW')) {
          pool.push({ id: 'artifact_crossbow', title: '遗物: 诸葛连弩', desc: '特效: 每回合自动触发全额伤害x20', rarity: 'LEGENDARY', type: 'ARTIFACT', icon: <CrossbowIcon className="w-full h-full text-lime-400"/>, apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'CROSSBOW'] }) });
      }
      if (!gameState.unlockedWeapons.includes('CHRONOS')) {
           pool.push({ id: 'artifact_chronos', title: '遗物: 时之轮', desc: '特效: 再次结算本轮伤害', rarity: 'LEGENDARY', type: 'ARTIFACT', icon: <RefreshCw className="w-full h-full text-cyan-300"/>, apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'CHRONOS'] }) });
      }

      let available = pool;
      if (gameState.maxDice >= MAX_DICE_CAP) available = available.filter(p => p.id !== 'ram_expansion');

      const getWeighted = () => {
          const r = Math.random();
          if (r > 0.92) return available.filter(p => p.rarity === 'LEGENDARY')[Math.floor(Math.random() * available.filter(p => p.rarity === 'LEGENDARY').length)];
          if (r > 0.80) return available.filter(p => p.rarity === 'CORRUPTED')[Math.floor(Math.random() * available.filter(p => p.rarity === 'CORRUPTED').length)];
          if (r > 0.60) return available.filter(p => p.rarity === 'RARE')[Math.floor(Math.random() * available.filter(p => p.rarity === 'RARE').length)];
          return available.filter(p => p.rarity === 'COMMON')[Math.floor(Math.random() * available.filter(p => p.rarity === 'COMMON').length)];
      };

      const safeGet = () => { const res = getWeighted(); return res || available[0]; };
      return [safeGet(), safeGet(), safeGet()].map((o, i) => ({...o, id: `${o.id}_${Date.now()}_${i}`}));
  };

  const calculateHandScore = (weaponId: WeaponType, diceValues: number[], unlocked: WeaponType[], cyberware: CyberwareDef[], modifier: BossModifier, gameState: GameState) => {
      const weapon = WEAPONS.find(w => w.id === weaponId);
      if(!weapon) return { chips: 0, mult: 0, total: 0 };

      let baseChips = weapon.baseChips;
      let baseMult = weapon.baseMult;
      let diceSum = diceValues.reduce((a,b) => a+b, 0);

      if (weaponId === 'OMNI_BLASTER') {
          const count = diceValues.length;
          const face = diceValues[0] || 0;
          baseMult = Math.floor((face + 2) * Math.pow(1.8, Math.max(0, count - 1)));
      }
      else if (weaponId === 'LINEAR_RAIL') {
          baseMult = Math.floor(diceValues.length * 2.4);
      }
      else if (weaponId === 'CROSSBOW') {
          baseChips = 0;
          baseMult = 20;
      }

      if (weaponId === 'MIDAS_HAND') baseChips = Math.floor(gameState.gold * 0.5); 

      if (modifier.effectId === 'FIREWALL') diceSum = diceValues.reduce((a,b) => b === 1 ? a : a+b, 0);
      if (modifier.effectId === 'DAMPENER') baseMult = Math.max(1, Math.floor(baseMult / 2));
      if (modifier.effectId === 'GLITCH') baseChips = Math.max(1, baseChips - 10);

      let context = { chips: baseChips, mult: baseMult, diceSum, weaponId, diceValues, level: gameState.level, turn: gameState.turn };
      for (const item of cyberware) {
          if(item.onCalculate) {
              const updates = item.onCalculate(context);
              context = { ...context, ...updates };
          }
      }
      const total = (context.chips + context.diceSum) * context.mult;
      return { chips: context.chips, mult: context.mult, total, diceSum: context.diceSum };
  };

  const calculateTriggeredWeapons = (diceValues: number[], unlocked: WeaponType[]) => {
      const triggered: { weapon: WeaponType, dice: number[] }[] = [];
      if (diceValues.length === 0) return triggered;

      const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0};
      diceValues.forEach(v => { if(v>0) counts[v]++ });
      const countValues = Object.values(counts);
      const maxCount = Math.max(...countValues);

      if (unlocked.includes('CROSSBOW')) {
          triggered.push({ weapon: 'CROSSBOW', dice: diceValues });
      }

      if (gameState.tacticalMission && diceValues.length > 0) {
           const mission = gameState.tacticalMission;
           let completed = false;
           const sum = diceValues.reduce((a,b)=>a+b,0);

           if (mission.type === 'SUM_GT' && sum > (mission.targetVal || 0)) completed = true;
           if (mission.type === 'SUM_LT' && sum < (mission.targetVal || 999)) completed = true;
           if (mission.type === 'ALL_ODD' && diceValues.every(d => d % 2 !== 0)) completed = true;
           if (mission.type === 'ALL_EVEN' && diceValues.every(d => d % 2 === 0)) completed = true;
           if (mission.type === 'NO_ONES' && !diceValues.includes(1)) completed = true;
           if (mission.type === 'HAS_PAIR') {
                if (Object.values(counts).some(c => c >= 2)) completed = true;
           }
           if (mission.type === 'HAS_SEQ') {
               const uniq = [...new Set(diceValues)].sort((a,b)=>a-b);
                let streak = 1, maxStreak = 1;
                for(let i=1; i<uniq.length; i++) {
                    if(uniq[i] === uniq[i-1]+1) { streak++; maxStreak = Math.max(maxStreak, streak); }
                    else streak = 1;
                }
                if (maxStreak >= 3) completed = true;
           }

           if (completed) triggered.push({ weapon: 'TACTICAL_EXEC', dice: diceValues });
      }

      // Handle "X of a Kind" (Omni/Grenade) per face value
      for (let face = 6; face >= 1; face--) {
          const count = counts[face];
          if (count >= 3) {
              const specificDice = Array(count).fill(face);
              if (unlocked.includes('OMNI_BLASTER')) {
                  triggered.push({ weapon: 'OMNI_BLASTER', dice: specificDice });
              } else if (unlocked.includes('GRENADE')) {
                  triggered.push({ weapon: 'GRENADE', dice: specificDice });
              }
          }
      }

      const uniq = Object.keys(counts).filter(k=>counts[Number(k)]>0).map(Number).sort((a,b)=>a-b);
      let streak = 1, maxStreak = 1;
      for(let i=1; i<uniq.length; i++) {
          if(uniq[i] === uniq[i-1]+1) { streak++; maxStreak = Math.max(maxStreak, streak); }
          else streak = 1;
      }
      
      if (maxStreak >= 3) {
           if (unlocked.includes('LINEAR_RAIL')) {
               let currentSeq: number[] = [uniq[0]];
               let bestSeq: number[] = [];
               for (let i=1; i<uniq.length; i++) {
                   if (uniq[i] === uniq[i-1] + 1) {
                       currentSeq.push(uniq[i]);
                   } else {
                       if (currentSeq.length > bestSeq.length) bestSeq = [...currentSeq];
                       currentSeq = [uniq[i]];
                   }
               }
               if (currentSeq.length > bestSeq.length) bestSeq = currentSeq;
               
               if (bestSeq.length >= 3) {
                   const railDice = diceValues.filter(d => bestSeq.includes(d)).sort((a,b)=>a-b);
                   triggered.push({ weapon: 'LINEAR_RAIL', dice: railDice });
               }
           }
           if (unlocked.includes('CHRONOS')) {
               triggered.push({ weapon: 'CHRONOS', dice: diceValues });
           }
      }

      const sum = diceValues.reduce((a,b)=>a+b, 0);
      if (sum >= 24 && unlocked.includes('DOOMSDAY')) triggered.push({ weapon: 'DOOMSDAY', dice: diceValues });

      let isFullHouse = countValues.includes(3) && countValues.includes(2);
      if (isFullHouse) {
         if (unlocked.includes('FLAMETHROWER')) triggered.push({ weapon: 'FLAMETHROWER', dice: diceValues });
         else if (unlocked.includes('RPG')) triggered.push({ weapon: 'RPG', dice: diceValues });
      }

      let isTwoPair = countValues.filter(c => c >= 2).length >= 2;
      if (isTwoPair && unlocked.includes('UZI')) triggered.push({ weapon: 'UZI', dice: diceValues });
      
      if (maxCount >= 2 && (unlocked.includes('SHOTGUN') || unlocked.includes('MIDAS_HAND'))) {
          if (unlocked.includes('SHOTGUN')) triggered.push({ weapon: 'SHOTGUN', dice: diceValues });
          if (unlocked.includes('MIDAS_HAND')) triggered.push({ weapon: 'MIDAS_HAND', dice: diceValues });
      }
      
      if (unlocked.includes('REVOLVER')) triggered.push({ weapon: 'REVOLVER', dice: diceValues });
      
      if (diceValues.length > 0 && diceValues.every(d => d % 2 !== 0) && unlocked.includes('PLASMA')) triggered.push({ weapon: 'PLASMA', dice: diceValues });
      if (diceValues.length > 0 && diceValues.every(d => d % 2 === 0) && unlocked.includes('VOID')) triggered.push({ weapon: 'VOID', dice: diceValues });
      if (sum <= 11 && unlocked.includes('SHIV')) triggered.push({ weapon: 'SHIV', dice: diceValues });

      return triggered;
  };

  const generateShopItems = (currentState: GameState = gameState): ShopItem[] => {
     const pool: ShopItem[] = [
         { id: 'repair', type: 'CONSUMABLE', name: '紧急维修包', desc: '恢复 30 HP', cost: 15, icon: <HeartIcon className="w-6 h-6"/> },
         { id: 'shield', type: 'CONSUMABLE', name: '能量护盾', desc: '增加 15 护盾', cost: 25, icon: <ShieldIcon className="w-6 h-6"/> },
         { id: 'reroll_up', type: 'CONSUMABLE', name: '机械手臂', desc: '+1 最大重随次数', cost: 40, icon: <RefreshCw className="w-6 h-6"/> },
     ];
     const randomCyber = CYBERWARE_POOL[Math.floor(Math.random() * CYBERWARE_POOL.length)];
     if(randomCyber && currentState.cyberware.length < currentState.maxCyberwareSlots) {
         pool.push({ id: `cyber_${randomCyber.id}_${Date.now()}`, type: 'CYBERWARE', name: randomCyber.name, desc: randomCyber.desc, cost: randomCyber.price, icon: randomCyber.icon, data: randomCyber });
     }
     const locked = WEAPONS.filter(w => !currentState.unlockedWeapons.includes(w.id) && !w.isArtifact && w.id !== 'TACTICAL_EXEC');
     if(locked.length > 0) {
         const w = locked[Math.floor(Math.random() * locked.length)];
         pool.push({ id: `unlock_${w.id}`, type: 'WEAPON', name: w.name, desc: w.req, cost: w.baseMult * 10 + 30, icon: <AimIcon className="w-6 h-6"/>, data: w.id });
     }
     return pool.slice(0, 3);
  };

  const handleToggleLock = (id: number) => {
      const die = gameState.dice.find(d => d.id === id);
      if(rolling || firing || gameState.status !== 'PLAYING' || !die || die.value === 0) return;
      setGameState(prev => ({ ...prev, dice: prev.dice.map(d => d.id === id ? { ...d, isLocked: !d.isLocked } : d) }));
  };

  const triggerRoll = useCallback((isFree: boolean = false) => {
      if (rolling || gameState.status !== 'PLAYING') return;
      if (!isFree && (firing || gameState.rerolls <= 0)) return;

      setRolling(true);
      setShaking(true);
      setShakeIntensity('NORMAL');
      if (!isFree) setGameState(prev => ({ ...prev, rerolls: prev.rerolls - 1 }));
      
      // UPDATED: Rerolling does NOT trigger turn start effects anymore. 
      // Turn start effects are handled at the beginning of a player's combat turn.

      setTimeout(() => {
          setShaking(false);
          setGameState(prev => ({ 
              ...prev, 
              dice: prev.dice.map(d => d.isLocked ? d : { ...d, value: getDistinctRandomFace(d.value) }) 
          }));
          setRolling(false);
      }, 600);
  }, [rolling, firing, gameState.status, gameState.rerolls]);

  const handleRollClick = () => triggerRoll(false);

  const executeEnemyAttack = async (damage: number, type: EnemyActionType, hits: number = 1) => {
      setEnemyAttacking(true);
      soundManager.playBossAttack();
      
      setGameState(prev => ({...prev, disabledWeapons: []}));

      const loopCount = type === 'COMBO' ? hits : 1;
      
      for (let i = 0; i < loopCount; i++) {
          await new Promise(r => setTimeout(r, 400));
          triggerShake('HEAVY');
          setScreenFlash(true);

          setGameState(prev => {
              let { playerHp, playerShield, maxRerolls, dice, maxDice, disabledWeapons, unlockedWeapons } = prev;
              
              let finalDamage = damage;
              if (type === 'PIERCING') { playerHp = Math.max(0, playerHp - damage); } 
              else {
                  if (playerShield >= damage) { playerShield -= damage; finalDamage = 0; } 
                  else { finalDamage = damage - playerShield; playerShield = 0; }
                  playerHp = Math.max(0, playerHp - finalDamage);
              }

              let nextDice = dice;
              let nextDisabled = [...disabledWeapons];

              if (i === loopCount - 1) {
                  if (type === 'DESTROY_SLOT') maxDice = Math.max(MIN_DICE_CAP, maxDice - 1);
                  if (type === 'AOE_GLITCH') {
                      nextDice = dice.map(d => ({ ...d, value: 1 as DieValue, isLocked: true }));
                  } else {
                      nextDice = dice.map(d => ({ ...d, value: 0 as DieValue, isLocked: false }));
                  }

                  if (type === 'JAM_WEAPON') {
                      const target = unlockedWeapons[Math.floor(Math.random() * unlockedWeapons.length)];
                      if (target) nextDisabled.push(target);
                  }
              }

              return { 
                  ...prev, 
                  playerHp, playerShield, maxDice, 
                  dice: nextDice, 
                  disabledWeapons: nextDisabled,
                  turn: i === loopCount - 1 ? prev.turn + 1 : prev.turn, 
                  status: playerHp <= 0 ? 'GAMEOVER' : 'PLAYING', 
                  rerolls: maxRerolls, // Reset Rerolls for next turn
                  enemyIntent: i === loopCount - 1 ? generateIntent(prev.level, prev.enemyType) : prev.enemyIntent 
              };
          });
          
          if (type === 'DESTROY_SLOT' && i === loopCount - 1) setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: 0, color: '#ef4444', isCrit: true, label: '槽位粉碎' }]);
          if (type === 'JAM_WEAPON' && i === loopCount - 1) setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: 0, color: '#94a3b8', isCrit: true, label: '被干扰' }]);
      }
      
      setEnemyAttacking(false);
  };

  const handleFire = async () => {
      if(rolling || firing || gameState.status !== 'PLAYING') return;
      if (gameState.dice.every(d => d.value === 0)) return;

      setFiring(true);
      const diceValues = gameState.dice.map(d => d.value).filter(v => v > 0);
      
      let triggeredHands = calculateTriggeredWeapons(diceValues, gameState.unlockedWeapons);
      
      triggeredHands = triggeredHands.filter(h => !gameState.disabledWeapons.includes(h.weapon));

      let currentEnemyHp = gameState.hp;
      let roundTotalDamage = 0;

      if (triggeredHands.length > 0) {
        triggeredHands.sort((a,b) => {
            const wA = WEAPONS.find(w=>w.id===a.weapon);
            const wB = WEAPONS.find(w=>w.id===b.weapon);
            if (a.weapon === 'TACTICAL_EXEC') return -1;
            if (b.weapon === 'TACTICAL_EXEC') return 1;
            if (a.weapon === 'CHRONOS') return 1;
            if (b.weapon === 'CHRONOS') return -1;

            return (wB?.baseMult || 0) - (wA?.baseMult || 0);
        });

        for(const hand of triggeredHands) {
            if(currentEnemyHp <= 0) break;

            setActiveWeaponId(hand.weapon);
            let score = calculateHandScore(hand.weapon, hand.dice, gameState.unlockedWeapons, gameState.cyberware, gameState.bossModifier, gameState);
            
            if (hand.weapon === 'CHRONOS') {
                score = { ...score, total: roundTotalDamage };
            }

            const weaponDef = WEAPONS.find(w => w.id === hand.weapon);
            
            const isCrit = score.total >= 50; 

            await new Promise(r => setTimeout(r, 200));
            
            let sfxType: 'KINETIC' | 'ENERGY' | 'EXPLOSIVE' | 'MELEE' = 'KINETIC';
            if(['PLASMA','VOID','LINEAR_RAIL'].includes(hand.weapon)) sfxType = 'ENERGY';
            if(['GRENADE','RPG','OMNI_BLASTER'].includes(hand.weapon)) sfxType = 'EXPLOSIVE';
            if(['SHIV','TACTICAL_EXEC'].includes(hand.weapon)) sfxType = 'MELEE';
            if(hand.weapon === 'CHRONOS') sfxType = 'ENERGY';
            
            soundManager.playWeaponSfx(sfxType, score.total);

            triggerShake(isCrit ? 'HEAVY' : 'NORMAL');
            if (isCrit) setScreenFlash(true);
            
            setEnemyHit(true);
            setTimeout(() => setEnemyHit(false), 150);
            spawnParticles(isCrit ? 20 : 8, isCrit ? '#facc15' : weaponDef?.color || '#fff', (Math.random()*100)-50);

            setDamagePopups(prev => [...prev, {
                id: Date.now() + Math.random(), value: score.total, x: (Math.random()*40)-20, y: (Math.random()*40)-20,
                color: weaponDef?.color || '#fff', isCrit, label: weaponDef?.name
            }]);

            currentEnemyHp -= score.total;
            roundTotalDamage += score.total;

            let lifestealAmount = Math.ceil(score.total * gameState.lifesteal);
            if (lifestealAmount > 0) setDamagePopups(prev => [...prev, { id: Date.now()+Math.random(), value: lifestealAmount, x: 40, y: -20, color: '#ef4444', isCrit: false, label: '吸收' }]);

            setGameState(prev => ({ 
                ...prev, hp: Math.max(0, currentEnemyHp),
                playerHp: Math.min(prev.maxPlayerHp, prev.playerHp + lifestealAmount),
                stats: { ...prev.stats, maxDamageDealt: Math.max(prev.stats.maxDamageDealt, score.total) } 
            }));
            await new Promise(r => setTimeout(r, 400)); 
        }
      }

      setActiveWeaponId(null);
      await new Promise(r => setTimeout(r, 500));
      
      if(currentEnemyHp <= 0) {
           spawnParticles(50, '#facc15');
           saveHighScore(gameState.level);
           setGameState(prev => ({ 
              ...prev, gold: prev.gold + 15 + Math.floor(prev.level * 5),
              stats: { ...prev.stats, enemiesKilled: prev.stats.enemiesKilled + 1 },
              dice: prev.dice.map(d => ({ ...d, value: 0 as DieValue, isLocked: false }))
          }));
          setRewardOptions(generateRewards());
          setShowRewards(true);
      } else {
          const intent = gameState.enemyIntent;
          await executeEnemyAttack(intent.damage, intent.type, intent.hits);
          // START PLAYER TURN Logic (after enemy attack)
          if (gameState.playerHp > 0) {
              setGameState(prev => startPlayerTurn(prev));
              triggerRoll(true);
          }
      }
      setFiring(false);
  };

  const handleSelectReward = (option: RewardOption) => {
    const newState = option.apply(gameState);
    setGameState(newState);
    
    if (gameState.level % 5 === 0) {
        setRewardOptions(generateChipOptions());
        setShowRewards(false);
        setShowChipSelect(true); 
    } else {
        setShopItems(generateShopItems(newState));
        setShowRewards(false);
        setShowShop(true); 
    }
  };

  const handleSelectChip = (option: RewardOption) => {
      let newState = option.apply(gameState);
      
      // Apply startPlayerTurn logic if it's Level 1 Turn 1 right after selection
      if (newState.level === 1 && newState.turn === 1) {
          newState = startPlayerTurn(newState);
      }

      setGameState(newState);
      setShowChipSelect(false);

      if (gameState.level === 1 && gameState.turn === 1) {
          setTimeout(() => triggerRoll(true), 500);
      } else {
          setShopItems(generateShopItems(newState));
          setShowShop(true);
      }
  };

  const isBossLevel = gameState.level % 5 === 0;

  return (
    <div className={`h-[100dvh] w-full overflow-hidden bg-[#050505] text-slate-200 font-sans flex flex-col items-center ${shaking ? (shakeIntensity === 'HEAVY' ? 'animate-shake-hard' : 'animate-shake') : ''}`}>
      {screenFlash && <div className="fixed inset-0 bg-white/20 z-[60] animate-flash pointer-events-none mix-blend-overlay"></div>}
      <Background isBoss={isBossLevel} />
      
      {gameState.status === 'START' && <StartScreen onStart={initGame} highScore={gameState.highScore} />}
      
      {gameState.status === 'GAMEOVER' && <GameOver level={gameState.level} stats={gameState.stats} onRestart={() => setGameState(prev => ({...prev, status: 'START'}))} />}
      
      {showChipSelect && <RewardModal headerTitle="选择核心协议" options={rewardOptions} onSelect={handleSelectChip} />}
      {showRewards && <RewardModal options={rewardOptions} onSelect={handleSelectReward} />}
      
      {showShop && <ShopModal items={shopItems} gold={gameState.gold} 
        onBuy={(item) => {
            if(gameState.gold >= item.cost) {
                setGameState(prev => {
                    let ns = { ...prev, gold: prev.gold - item.cost };
                    if(item.type === 'WEAPON') ns.unlockedWeapons = [...ns.unlockedWeapons, item.data];
                    if(item.type === 'CYBERWARE') ns.cyberware = [...ns.cyberware, item.data];
                    if(item.id === 'repair') ns.playerHp = Math.min(ns.maxPlayerHp, ns.playerHp + 30);
                    if(item.id === 'shield') ns.playerShield = Math.min(100, ns.playerShield + 15);
                    if(item.id === 'reroll_up') ns.maxRerolls += 1;
                    return ns;
                });
                setShopItems(prev => prev.filter(i => i.id !== item.id));
            }
        }} 
        onNextLevel={() => {
            setShowShop(false);
            const nextLevel = gameState.level + 1;
            const isBoss = nextLevel % 5 === 0;
            
            soundManager.setBgmMode(isBoss ? 'BOSS' : 'NORMAL');

            const nextBossModifier = isBoss ? BOSS_MODIFIERS[Math.floor(Math.random() * (BOSS_MODIFIERS.length - 1)) + 1] : (nextLevel % 3 === 0 ? BOSS_MODIFIERS[Math.floor(Math.random() * BOSS_MODIFIERS.length)] : BOSS_MODIFIERS[0]);
            
            const bossTypes = ['BOSS_1', 'BOSS_2', 'BOSS_3', 'BOSS_4', 'BOSS_5']; 
            const nextType = isBoss ? bossTypes[Math.floor(Math.random() * bossTypes.length)] : bossTypes[nextLevel % bossTypes.length];
            
            // BUFFED BOSS HP SCALING: Steeper curve
            const baseGrowth = (200 + (nextLevel * 60)) * 10; 
            const hpMultiplier = isBoss ? 6 : 4;
            
            // Apply Level 1-10 Nerf to HP still applies but base is higher
            let hpScale = 1.0;
            if (nextLevel <= 10) hpScale = 0.7;
            const nextHp = Math.floor(baseGrowth * hpMultiplier * hpScale);

            setGameState(prev => {
                const s = {
                    ...prev, level: nextLevel,
                    hp: nextHp, maxHp: nextHp,
                    bossModifier: nextBossModifier,
                    enemyType: nextType, enemyIntent: generateIntent(nextLevel, nextType),
                    dice: prev.dice.map(d => ({ ...d, isLocked: false, value: 0 as DieValue })),
                    tacticalMission: generateMission() 
                };
                return startPlayerTurn(s); // Start turn Logic here too
            });
            setTimeout(() => triggerRoll(true), 100); 
        }} />}

      {gameState.status !== 'START' && (
        <div className="relative z-10 w-[95%] max-w-7xl h-full flex flex-col animate-in fade-in duration-700">
            
            <div className="flex-none z-30 mt-2">
                <BattleHUD 
                    level={gameState.level}
                    gold={gameState.gold}
                    cyberware={gameState.cyberware}
                    maxCyberwareSlots={gameState.maxCyberwareSlots}
                    playerHp={gameState.playerHp}
                    maxPlayerHp={gameState.maxPlayerHp}
                    playerShield={gameState.playerShield}
                    enemyHp={gameState.hp}
                    maxEnemyHp={gameState.maxHp}
                    enemyName={gameState.enemyType}
                    enemyIntent={gameState.enemyIntent}
                    bossModifier={gameState.bossModifier}
                    isBoss={isBossLevel}
                />
            </div>

            <div className="flex-1 flex flex-col relative bg-gradient-to-b from-slate-900/10 to-transparent mx-0 sm:mx-2 my-1 rounded-xl overflow-visible">
                <DamageFeedback items={damagePopups} />
                <VfxLayer particles={particles} />
                
                <div className="flex-[1.5] flex items-center justify-center relative min-h-0 pt-4 pb-4">
                    <Enemy hp={gameState.hp} maxHp={gameState.maxHp} typeId={gameState.enemyType} isHit={enemyHit} modifier={gameState.bossModifier} intent={gameState.enemyIntent} />
                </div>
                
                <div className={`flex-1 flex items-start justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 ${enemyAttacking && gameState.enemyIntent.type === 'AOE_GLITCH' ? 'animate-glitch-anim' : ''}`}>
                    <div className={`relative flex flex-wrap justify-center gap-2 sm:gap-4 p-2 transition-transform duration-100 ${shaking ? 'blur-sm scale-95' : 'scale-100'}`}>
                        {gameState.dice.map(d => (
                            <Die key={d.id} data={d} toggleLock={handleToggleLock} disabled={rolling || firing || d.value === 0} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-none flex flex-col gap-1 p-2 pb-6 sm:pb-8 bg-slate-950/90 backdrop-blur border-t border-white/10 z-30">
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide mask-linear-fade px-4 min-h-[150px] items-end">
                    {WEAPONS.filter(w => gameState.unlockedWeapons.includes(w.id)).map(w => (
                        <WeaponCard 
                            key={w.id} 
                            weapon={w.id === 'TACTICAL_EXEC' && gameState.tacticalMission ? { ...w, description: gameState.tacticalMission.desc } : w} 
                            isActive={true} 
                            isFiring={activeWeaponId === w.id} 
                            isDisabled={gameState.disabledWeapons.includes(w.id)}
                            level={gameState.level}
                        />
                    ))}
                </div>
                <Controls onRoll={handleRollClick} onFire={handleFire} rerolls={gameState.rerolls} maxRerolls={gameState.maxRerolls} isRolling={rolling} isFiring={firing} />
            </div>
        </div>
      )}
    </div>
  );
}
